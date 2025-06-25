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

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const hasToken = !!process.env.GOOGLE_TOKEN || await fs.access(TOKEN_PATH).then(() => true).catch(() => false);
    const hasCredentials = await fs.access(CREDENTIALS_PATH).then(() => true).catch(() => false);
    
    res.json({
      status: 'debug info',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      hasGoogleToken: hasToken,
      hasCredentialsFile: hasCredentials,
      tokenPath: TOKEN_PATH,
      credentialsPath: CREDENTIALS_PATH,
      currentDirectory: process.cwd()
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

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
const PTO_DATA_PATH = path.join(__dirname, 'pto-data.json');

// Track automation status
let automationEnabled = true;
let lastStatus = null;

// Load saved credentials
async function loadSavedCredentialsIfExist() {
  try {
    // First check if we have token in environment variable (for Render)
    if (process.env.GOOGLE_TOKEN) {
      console.log('Loading credentials from environment variable');
      const credentials = JSON.parse(process.env.GOOGLE_TOKEN);
      return google.auth.fromJSON(credentials);
    }
    
    // Otherwise try to load from file (for local development)
    console.log('Looking for token at:', TOKEN_PATH);
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    console.log('Successfully loaded credentials from file');
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.error('Failed to load credentials:', err.message);
    return null;
  }
}

// Get authenticated client
async function authorize() {
  try {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    throw new Error('No saved credentials found. Please run locally first to authenticate.');
  } catch (error) {
    console.error('Authorization error:', error.message);
    throw error;
  }
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
      selectedCalendarId: 'primary',  // Default to primary calendar
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

// ===== PTO DATA STORAGE FUNCTIONS =====
async function loadPTOData() {
  try {
    const data = await fs.readFile(PTO_DATA_PATH, 'utf8');
    const parsedData = JSON.parse(data);
    
    // Check if we need to reset PTO for new year
    const currentYear = new Date().getFullYear();
    if (!parsedData.lastResetYear || parsedData.lastResetYear < currentYear) {
      console.log(`New year detected! Resetting PTO balance for ${currentYear}`);
      parsedData.ptoBalance = {
        available: 15, // Reset to default annual PTO
        used: 0,
        planned: 0
      };
      parsedData.lastResetYear = currentYear;
      await savePTOData(parsedData);
    }
    
    return parsedData;
  } catch (error) {
    // File doesn't exist, return defaults with pre-populated holidays
    const currentYear = new Date().getFullYear();
    
    const defaults = {
      ptoBalance: { available: 15, used: 0, planned: 0 },
      lastResetYear: currentYear,
      holidays: [
        { id: 'h1', name: "New Year's Day", date: '2025-01-01', observedDate: '2025-01-01' },
        { id: 'h2', name: 'Martin Luther King Jr. Day', date: '2025-01-20', observedDate: '2025-01-20' },
        { id: 'h3', name: "Presidents' Day", date: '2025-02-17', observedDate: '2025-02-17' },
        { id: 'h4', name: 'Memorial Day', date: '2025-05-26', observedDate: '2025-05-26' },
        { id: 'h5', name: 'Independence Day', date: '2025-07-04', observedDate: '2025-07-04' },
        { id: 'h6', name: 'Labor Day', date: '2025-09-01', observedDate: '2025-09-01' },
        { id: 'h7', name: 'Thanksgiving', date: '2025-11-27', observedDate: '2025-11-27' },
        { id: 'h8', name: 'Day After Thanksgiving', date: '2025-11-28', observedDate: '2025-11-28' },
        { id: 'h9', name: 'Christmas Eve', date: '2025-12-24', observedDate: '2025-12-24' },
        { id: 'h10', name: 'Christmas', date: '2025-12-25', observedDate: '2025-12-25' }
      ]
    };
    
    await savePTOData(defaults);
    return defaults;
  }
}

async function savePTOData(data) {
  await fs.writeFile(PTO_DATA_PATH, JSON.stringify(data, null, 2));
}

async function getPTOBalance() {
  const data = await loadPTOData();
  return data.ptoBalance;
}

async function savePTOBalance(balance) {
  const data = await loadPTOData();
  data.ptoBalance = balance;
  await savePTOData(data);
}

async function getHolidays() {
  const data = await loadPTOData();
  return data.holidays;
}

async function addHoliday(holiday) {
  const data = await loadPTOData();
  data.holidays.push(holiday);
  await savePTOData(data);
}

async function deleteHoliday(id) {
  const data = await loadPTOData();
  data.holidays = data.holidays.filter(h => h.id !== id);
  await savePTOData(data);
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
    
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    
    console.log('Fetching events from:', startOfYear.toISOString(), 'to:', endOfYear.toISOString());
    console.log('Using calendar:', settings.selectedCalendarId || 'primary');
    
    const response = await calendar.events.list({
      calendarId: settings.selectedCalendarId || 'primary',
      timeMin: startOfYear.toISOString(),
      timeMax: endOfYear.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    console.log(`Found ${response.data.items.length} total events`);
    
    // Filter for OOO events and include IDs
    const oooEvents = response.data.items
      .filter(event => {
        const summary = event.summary || '';
        const eventType = event.eventType || 'default';
        const summaryLower = summary.toLowerCase();
        return eventType === 'outOfOffice' || 
               summaryLower.includes('out of office') || 
               summaryLower.includes('ooo') ||
               summaryLower.includes('pto');
      })
      .map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        description: event.description,
        location: event.location
      }));
    
    console.log(`Filtered to ${oooEvents.length} OOO/PTO events`);
    
    res.json({ events: oooEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
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

// ===== PTO BALANCE ENDPOINTS =====

// Get PTO balance
app.get('/api/pto-balance', async (req, res) => {
  try {
    const balance = await getPTOBalance();
    res.json(balance);
  } catch (error) {
    console.error('Error fetching PTO balance:', error);
    res.status(500).json({ error: 'Failed to fetch PTO balance' });
  }
});

// Update PTO balance
app.post('/api/pto-balance', async (req, res) => {
  try {
    const { available, used, planned } = req.body;
    await savePTOBalance({ available, used, planned });
    
    await addLog({
      action: 'pto_balance_updated',
      details: `PTO balance updated: ${available} days available`
    });
    
    res.json({ available, used, planned });
  } catch (error) {
    console.error('Error updating PTO balance:', error);
    res.status(500).json({ error: 'Failed to update PTO balance' });
  }
});

// ===== HOLIDAY ENDPOINTS =====

// Get all holidays
app.get('/api/holidays', async (req, res) => {
  try {
    const holidays = await getHolidays();
    res.json({ holidays });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// Add a new holiday
app.post('/api/holidays', async (req, res) => {
  try {
    const { name, date, observedDate } = req.body;
    
    const newHoliday = {
      id: `holiday-${Date.now()}`,
      name,
      date,
      observedDate: observedDate || date
    };
    
    await addHoliday(newHoliday);
    
    await addLog({
      action: 'holiday_added',
      details: `Added holiday: ${name}`
    });
    
    res.json(newHoliday);
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

// Delete a holiday
app.delete('/api/holidays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHoliday(id);
    
    await addLog({
      action: 'holiday_deleted',
      details: `Deleted holiday`
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

// ===== SMART PTO SUGGESTIONS ENDPOINT =====

app.get('/api/pto-suggestions', async (req, res) => {
  try {
    const holidays = await getHolidays();
    const ptoBalance = await getPTOBalance();
    
    const suggestions = generatePTOSuggestions(holidays, ptoBalance);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating PTO suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// ===== PTO SUGGESTION HELPER FUNCTIONS =====

// Generate smart PTO suggestions based on holidays
function generatePTOSuggestions(holidays, ptoBalance) {
  const suggestions = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  holidays.forEach(holiday => {
    const holidayDate = new Date(holiday.observedDate);
    const dayOfWeek = holidayDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Skip if holiday is in the past
    if (holidayDate < today) return;
    
    // Case 1: Holiday on Thursday (day 4) - suggest Friday off
    if (dayOfWeek === 4) {
      const friday = new Date(holidayDate);
      friday.setDate(friday.getDate() + 1);
      
      suggestions.push({
        title: `${holiday.name} Extended Weekend`,
        dateRange: formatDateRange(holidayDate, 4),
        ptoDays: [formatDate(friday)],
        ptoDaysCount: 1,
        totalDaysOff: 4,
        description: `Take Friday off after ${holiday.name} for a 4-day weekend`,
        returnDate: formatReturnDate(holidayDate, 4)
      });
    }
    
    // Case 2: Holiday on Tuesday (day 2) - suggest Monday off
    if (dayOfWeek === 2) {
      const monday = new Date(holidayDate);
      monday.setDate(monday.getDate() - 1);
      
      suggestions.push({
        title: `${holiday.name} Extended Weekend`,
        dateRange: formatDateRange(monday, 4),
        ptoDays: [formatDate(monday)],
        ptoDaysCount: 1,
        totalDaysOff: 4,
        description: `Take Monday off before ${holiday.name} for a 4-day weekend`,
        returnDate: formatReturnDate(holidayDate, 1)
      });
    }
    
    // Case 3: Holiday on Wednesday - suggest full week off
    if (dayOfWeek === 3) {
      const monday = new Date(holidayDate);
      monday.setDate(monday.getDate() - 2);
      const tuesday = new Date(holidayDate);
      tuesday.setDate(tuesday.getDate() - 1);
      const thursday = new Date(holidayDate);
      thursday.setDate(thursday.getDate() + 1);
      const friday = new Date(holidayDate);
      friday.setDate(friday.getDate() + 2);
      
      suggestions.push({
        title: `${holiday.name} Full Week`,
        dateRange: formatDateRange(monday, 9),
        ptoDays: [formatDate(monday), formatDate(tuesday), formatDate(thursday), formatDate(friday)],
        ptoDaysCount: 4,
        totalDaysOff: 9,
        description: `Take the full week around ${holiday.name} for a 9-day break`,
        returnDate: formatReturnDate(monday, 9)
      });
    }
    
    // Case 4: Holiday on Monday or Friday - already creates long weekend
    if (dayOfWeek === 1 || dayOfWeek === 5) {
      if (dayOfWeek === 5) { // Friday
        const thursday = new Date(holidayDate);
        thursday.setDate(thursday.getDate() - 1);
        
        suggestions.push({
          title: `${holiday.name} Extended Weekend`,
          dateRange: formatDateRange(thursday, 4),
          ptoDays: [formatDate(thursday)],
          ptoDaysCount: 1,
          totalDaysOff: 4,
          description: `Take Thursday off before ${holiday.name} for a 4-day weekend`,
          returnDate: formatReturnDate(holidayDate, 3)
        });
      }
      
      if (dayOfWeek === 1) { // Monday
        const tuesday = new Date(holidayDate);
        tuesday.setDate(tuesday.getDate() + 1);
        
        suggestions.push({
          title: `${holiday.name} Extended Break`,
          dateRange: formatDateRange(holidayDate, 4),
          ptoDays: [formatDate(tuesday)],
          ptoDaysCount: 1,
          totalDaysOff: 4,
          description: `Take Tuesday off after ${holiday.name} for a 4-day weekend`,
          returnDate: formatReturnDate(tuesday, 1)
        });
      }
    }
  });
  
  // Look for holiday clusters (e.g., Thanksgiving week, Christmas/New Year)
  const thanksgivingHoliday = holidays.find(h => h.name.toLowerCase().includes('thanksgiving') && !h.name.toLowerCase().includes('after'));
  if (thanksgivingHoliday) {
    const thanksgivingDate = new Date(thanksgivingHoliday.observedDate);
    const monday = new Date(thanksgivingDate);
    monday.setDate(monday.getDate() - 3);
    const tuesday = new Date(thanksgivingDate);
    tuesday.setDate(tuesday.getDate() - 2);
    const wednesday = new Date(thanksgivingDate);
    wednesday.setDate(wednesday.getDate() - 1);
    const friday = new Date(thanksgivingDate);
    friday.setDate(friday.getDate() + 1);
    
    // Check if Friday after Thanksgiving is also a holiday
    const dayAfterThanksgiving = holidays.find(h => 
      h.name.toLowerCase().includes('after thanksgiving') || 
      formatDate(new Date(h.observedDate)) === formatDate(friday)
    );
    
    if (dayAfterThanksgiving) {
      // Only need Mon-Wed off
      suggestions.push({
        title: 'Thanksgiving Week Off',
        dateRange: formatDateRange(monday, 9),
        ptoDays: [formatDate(monday), formatDate(tuesday), formatDate(wednesday)],
        ptoDaysCount: 3,
        totalDaysOff: 9,
        description: 'Take 3 days for a full week off around Thanksgiving',
        returnDate: formatReturnDate(monday, 9)
      });
    } else {
      // Need Mon-Wed + Friday
      suggestions.push({
        title: 'Thanksgiving Week Off',
        dateRange: formatDateRange(monday, 9),
        ptoDays: [formatDate(monday), formatDate(tuesday), formatDate(wednesday), formatDate(friday)],
        ptoDaysCount: 4,
        totalDaysOff: 9,
        description: 'Take 4 days for a full week off around Thanksgiving',
        returnDate: formatReturnDate(monday, 9)
      });
    }
  }
  
  // Filter suggestions based on available PTO and remove duplicates
  const uniqueSuggestions = suggestions
    .filter(s => s.ptoDaysCount <= ptoBalance.available)
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.title === suggestion.title)
    )
    .sort((a, b) => {
      // Sort by efficiency (days off per PTO day used)
      const efficiencyA = a.totalDaysOff / a.ptoDaysCount;
      const efficiencyB = b.totalDaysOff / b.ptoDaysCount;
      return efficiencyB - efficiencyA;
    });
  
  return uniqueSuggestions;
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Helper function to format date range
function formatDateRange(startDate, daysOff) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysOff - 1);
  
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${startStr} - ${endStr}`;
}

// Helper function to format return date
function formatReturnDate(startDate, daysOff) {
  const returnDate = new Date(startDate);
  returnDate.setDate(returnDate.getDate() + daysOff);
  
  // Skip to Monday if return date is weekend
  if (returnDate.getDay() === 0) returnDate.setDate(returnDate.getDate() + 1);
  if (returnDate.getDay() === 6) returnDate.setDate(returnDate.getDate() + 2);
  
  return formatDate(returnDate);
}

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
      const summaryLower = summary.toLowerCase();
      
      if (eventType === 'outOfOffice' || 
          summaryLower.includes('out of office') || 
          summaryLower.includes('ooo') ||
          summaryLower.includes('pto')) {
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🌍 Server is listening on all network interfaces`);
  console.log('📅 Starting background calendar checks...\n');
  
  // Run check immediately
  runCheck();
  
  // Then every 5 minutes
  setInterval(runCheck, 5 * 60 * 1000);
});