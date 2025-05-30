const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Define the permissions we need
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',  // Added write permission
  'https://www.googleapis.com/auth/gmail.settings.basic'
];

// File paths
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SETTINGS_PATH = path.join(__dirname, 'settings.json');
const LOGS_PATH = path.join(__dirname, 'logs.json');

// Track automation status
let automationEnabled = true;
let lastStatus = null;

// Load saved credentials
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

// Get authenticated client
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  throw new Error('No saved credentials found. Please run locally first to authenticate.');
}

// Load settings
async function loadSettings() {
  try {
    const content = await fs.readFile(SETTINGS_PATH);
    return JSON.parse(content);
  } catch (err) {
    // Default settings
    const defaults = {
      defaultTone: 'professional',
      selectedCalendarId: 'primary',
      slackEnabled: false,
      slackToken: null,
      slackEmoji: ':palm_tree:',
      slackStatusTemplate: 'Out of Office until {date}',
      templates: {
        professional: 'Hi there - I am currently out of office and will return on {date}. I will be checking messages periodically but may be slow to respond.',
        casual: 'Hey! I am away right now but I will get back to you as soon as I return on {date}. Thanks!'
      }
    };
    await saveSettings(defaults);
    return defaults;
  }
}

// Save settings
async function saveSettings(settings) {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

// Add log entry
async function addLog(entry) {
  let logs = [];
  try {
    const content = await fs.readFile(LOGS_PATH);
    logs = JSON.parse(content);
  } catch (err) {
    // Start with empty logs
  }
  
  logs.unshift({
    timestamp: new Date().toISOString(),
    ...entry
  });
  
  // Keep only last 50 logs
  logs = logs.slice(0, 50);
  
  await fs.writeFile(LOGS_PATH, JSON.stringify(logs, null, 2));
}

// API Routes

// Get current status
app.get('/api/status', async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    
    const vacation = await gmail.users.settings.getVacation({
      userId: 'me'
    });
    
    res.json({
      automationEnabled,
      vacationResponder: {
        enabled: vacation.data.enableAutoReply || false,
        message: vacation.data.responseBodyPlainText || '',
        subject: vacation.data.responseSubject || ''
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming OOO events
app.get('/api/events', async (req, res) => {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const settings = await loadSettings();
    
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const response = await calendar.events.list({
      calendarId: settings.selectedCalendarId || 'primary',
      timeMin: now.toISOString(),
      timeMax: twoWeeksFromNow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // Filter for OOO events and include IDs
    const oooEvents = response.data.items
      .filter(event => {
        const summary = event.summary || '';
        const eventType = event.eventType || 'default';
        return eventType === 'outOfOffice' || summary.toLowerCase().includes('out of office');
      })
      .map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        description: event.description,
        location: event.location
      }));
    
    res.json({ events: oooEvents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await loadSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available calendars
app.get('/api/calendars', async (req, res) => {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.calendarList.list({
      minAccessRole: 'writer'  // Only calendars we can write to
    });
    
    const calendars = response.data.items.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor,
      accessRole: cal.accessRole
    }));
    
    res.json({ calendars });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
app.post('/api/settings', async (req, res) => {
  try {
    await saveSettings(req.body);
    await addLog({
      action: 'settings_updated',
      details: 'Settings were updated'
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle automation
app.post('/api/toggle-automation', async (req, res) => {
  try {
    automationEnabled = req.body.enabled;
    await addLog({
      action: 'automation_toggled',
      enabled: automationEnabled,
      details: `Automation ${automationEnabled ? 'enabled' : 'disabled'}`
    });
    res.json({ automationEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual toggle vacation responder
app.post('/api/toggle-responder', async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });
    
    const { enabled, message } = req.body;
    
    await gmail.users.settings.updateVacation({
      userId: 'me',
      requestBody: {
        enableAutoReply: enabled,
        responseSubject: enabled ? 'Out of Office' : '',
        responseBodyPlainText: enabled ? message : '',
        restrictToContacts: false,
        restrictToDomain: false
      }
    });
    
    await addLog({
      action: 'manual_toggle',
      enabled,
      details: `Vacation responder manually ${enabled ? 'enabled' : 'disabled'}`
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs
app.get('/api/logs', async (req, res) => {
  try {
    const content = await fs.readFile(LOGS_PATH);
    const logs = JSON.parse(content);
    res.json({ logs: logs.slice(0, 10) }); // Return last 10
  } catch (error) {
    res.json({ logs: [] });
  }
});

// Slack OAuth configuration
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '353761788483.8996990423200';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '80f3c71907df86d6c0e22bdb116a0d4d';
const SLACK_REDIRECT_URI = 'https://ooo-api-o6ab.onrender.com/api/slack/callback';

// Initiate Slack OAuth
app.get('/api/slack/auth', (req, res) => {
  const scopes = 'users.profile:write,users:write';
  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${SLACK_REDIRECT_URI}`;
  res.json({ authUrl });
});

// Slack OAuth callback
app.get('/api/slack/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: SLACK_REDIRECT_URI
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      // Save the token
      const settings = await loadSettings();
      settings.slackToken = data.authed_user.access_token;
      settings.slackUserId = data.authed_user.id;
      settings.slackTeamId = data.team.id;
      settings.slackEnabled = true;
      await saveSettings(settings);
      
      await addLog({
        action: 'slack_connected',
        details: 'Connected Slack workspace successfully'
      });
      
      // Redirect to PRODUCTION frontend
      res.redirect('https://ooo-otghhbxfg-felixs-projects-98c54b12.vercel.app?slack=connected');
    } else {
      res.redirect('https://ooo-otghhbxfg-felixs-projects-98c54b12.vercel.app?slack=error');
    }
  } catch (error) {
    console.error('Slack OAuth error:', error);
    res.redirect('https://ooo-otghhbxfg-felixs-projects-98c54b12.vercel.app?slack=error');
  }
});

// Update Slack status
async function updateSlackStatus(settings, oooStatus) {
  if (!settings.slackEnabled || !settings.slackToken) {
    return;
  }
  
  try {
    let statusText = settings.slackStatusTemplate;
    if (oooStatus.isOOO) {
      const endDate = new Date(oooStatus.endTime);
      const dateStr = endDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      statusText = statusText.replace('{date}', dateStr);
      
      // Set status with expiration
      const profileUpdate = await fetch('https://slack.com/api/users.profile.set', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: {
            status_text: statusText,
            status_emoji: settings.slackEmoji || ':palm_tree:',
            status_expiration: Math.floor(new Date(oooStatus.endTime).getTime() / 1000)
          }
        })
      });
      
      // Set presence to away
      const presenceUpdate = await fetch('https://slack.com/api/users.setPresence', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presence: 'away'
        })
      });
      
      await addLog({
        action: 'slack_status_updated',
        details: `Slack status set: ${statusText}`
      });
    } else {
      // Clear status
      await fetch('https://slack.com/api/users.profile.set', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: {
            status_text: '',
            status_emoji: '',
            status_expiration: 0
          }
        })
      });
      
      // Set presence to auto
      await fetch('https://slack.com/api/users.setPresence', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presence: 'auto'
        })
      });
      
      await addLog({
        action: 'slack_status_cleared',
        details: 'Slack status cleared'
      });
    }
  } catch (error) {
    console.error('Error updating Slack status:', error);
  }
}

// Disconnect Slack
app.post('/api/slack/disconnect', async (req, res) => {
  try {
    const settings = await loadSettings();
    settings.slackEnabled = false;
    settings.slackToken = null;
    settings.slackUserId = null;
    settings.slackTeamId = null;
    await saveSettings(settings);
    
    await addLog({
      action: 'slack_disconnected',
      details: 'Disconnected Slack workspace'
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create OOO event
app.post('/api/create-event', async (req, res) => {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const settings = await loadSettings();
    
    const { summary, startDate, startTime, endDate, endTime, tone, customMessage, allDay } = req.body;
    
    // Build event object - without eventType to avoid description restriction
    const event = {
      summary: tone ? `${summary} | ${tone}` : summary
    };
    
    // Only add description if there's a custom message and we're not using eventType
    if (customMessage) {
      event.description = `[[OOO_MESSAGE: ${customMessage}]]`;
    }
    
    // Handle date/time with timezone
    if (allDay) {
      event.start = { date: startDate };
      event.end = { date: endDate };
    } else {
      event.start = { 
        dateTime: `${startDate}T${startTime}:00`,
        timeZone: 'America/New_York'
      };
      event.end = { 
        dateTime: `${endDate}T${endTime}:00`,
        timeZone: 'America/New_York'
      };
    }
    
    // Create the event
    const response = await calendar.events.insert({
      calendarId: settings.selectedCalendarId || 'primary',
      requestBody: event
    });
    
    await addLog({
      action: 'event_created',
      event: summary,
      details: `Created OOO event: ${summary}`
    });
    
    res.json({ success: true, event: response.data });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete OOO event
app.delete('/api/delete-event/:eventId', async (req, res) => {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    const settings = await loadSettings();
    
    const { eventId } = req.params;
    
    // Get event details first (for logging)
    let eventSummary = 'Unknown event';
    try {
      const event = await calendar.events.get({
        calendarId: settings.selectedCalendarId || 'primary',
        eventId: eventId
      });
      eventSummary = event.data.summary || 'Untitled event';
    } catch (err) {
      // Event might not exist, continue with deletion attempt
    }
    
    // Delete the event
    await calendar.events.delete({
      calendarId: settings.selectedCalendarId || 'primary',
      eventId: eventId
    });
    
    await addLog({
      action: 'event_deleted',
      event: eventSummary,
      details: `Deleted OOO event: ${eventSummary}`
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.code === 404) {
      res.status(404).json({ error: 'Event not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Check if user is currently out of office
async function checkOutOfOffice(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const settings = await loadSettings();
  const now = new Date();
  
  try {
    const response = await calendar.events.list({
      calendarId: settings.selectedCalendarId || 'primary',
      timeMin: now.toISOString(),
      timeMax: new Date(now.getTime() + 60000).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    
    for (const event of events) {
      const summary = event.summary || '';
      const eventType = event.eventType || 'default';
      
      if (eventType === 'outOfOffice' || summary.toLowerCase().includes('out of office')) {
        const endTime = event.end.dateTime || event.end.date;
        let customMessage = null;
        let tone = 'professional';
        
        if (event.description) {
          const messageMatch = event.description.match(/\[\[OOO_MESSAGE:\s*(.*?)\]\]/);
          if (messageMatch) {
            customMessage = messageMatch[1];
          }
        }
        
        if (summary.includes('|')) {
          const parts = summary.split('|');
          const possibleTone = parts[1].trim().toLowerCase();
          if (['casual', 'professional'].includes(possibleTone)) {
            tone = possibleTone;
          }
        }
        
        return {
          isOOO: true,
          endTime: endTime,
          customMessage: customMessage,
          tone: tone,
          eventName: summary
        };
      }
    }
    
    return { isOOO: false };
  } catch (error) {
    console.error('Error checking calendar:', error);
    return { isOOO: false };
  }
}

// Update Gmail vacation responder
async function updateGmailResponder(auth, oooStatus) {
  const gmail = google.gmail({ version: 'v1', auth });
  const settings = await loadSettings();
  
  try {
    if (oooStatus.isOOO) {
      let message = oooStatus.customMessage;
      
      if (!message) {
        message = settings.templates[oooStatus.tone] || settings.templates[settings.defaultTone];
        const endDate = new Date(oooStatus.endTime);
        const dateStr = endDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        message = message.replace('{date}', dateStr);
      }
      
      await gmail.users.settings.updateVacation({
        userId: 'me',
        requestBody: {
          enableAutoReply: true,
          responseSubject: 'Out of Office',
          responseBodyPlainText: message,
          restrictToContacts: false,
          restrictToDomain: false
        }
      });
      
      await addLog({
        action: 'auto_enabled',
        event: oooStatus.eventName,
        details: `Auto-responder enabled for: ${oooStatus.eventName}`
      });
      
    } else {
      await gmail.users.settings.updateVacation({
        userId: 'me',
        requestBody: {
          enableAutoReply: false
        }
      });
      
      await addLog({
        action: 'auto_disabled',
        details: 'Auto-responder disabled (no OOO events)'
      });
    }
    
    // Update Slack status too
    await updateSlackStatus(settings, oooStatus);
    
  } catch (error) {
    console.error('Error updating Gmail responder:', error);
  }
}

// Background check function
async function runCheck() {
  if (!automationEnabled) {
    console.log('Automation is disabled - skipping check');
    return;
  }
  
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] Running OOO check...`);
  
  try {
    const auth = await authorize();
    const oooStatus = await checkOutOfOffice(auth);
    const currentStatus = oooStatus.isOOO;
    
    if (lastStatus === null || lastStatus !== currentStatus) {
      console.log('Status changed! Updating Gmail...');
      await updateGmailResponder(auth, oooStatus);
      lastStatus = currentStatus;
    } else {
      console.log('No status change - skipping Gmail update');
    }
  } catch (error) {
    console.error('Error during check:', error.message);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log('📅 Starting background calendar checks...\n');
  
  // Run check immediately
  runCheck();
  
  // Then every 5 minutes
  setInterval(runCheck, 5 * 60 * 1000);
});