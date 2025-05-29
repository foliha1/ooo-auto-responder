const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// Define the permissions we need
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',  // ADD THIS LINE
  'https://www.googleapis.com/auth/gmail.settings.basic'
];

// File paths
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Load saved credentials if they exist
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

// Save credentials for next time
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

// Get authenticated client
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// Check if user is currently out of office
async function checkOutOfOffice(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date();
  
  try {
    // Get events happening right now
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: new Date(now.getTime() + 60000).toISOString(), // Check 1 minute window
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    
    // Look for OOO events
    for (const event of events) {
      const summary = event.summary || '';
      const eventType = event.eventType || 'default';
      
      // Check if this is an OOO event
      if (eventType === 'outOfOffice' || summary.toLowerCase().includes('out of office')) {
        console.log('📅 Found OOO event: "' + summary + '"');
        
        // Extract end time
        const endTime = event.end.dateTime || event.end.date;
        
        // Extract any custom message or tone
        let customMessage = null;
        let tone = 'professional'; // default
        
        if (event.description) {
          // Look for custom message
          const messageMatch = event.description.match(/\[\[OOO_MESSAGE:\s*(.*?)\]\]/);
          if (messageMatch) {
            customMessage = messageMatch[1];
          }
        }
        
        // Look for tone in title
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
  
  try {
    if (oooStatus.isOOO) {
      // Prepare the message
      let message = oooStatus.customMessage;
      
      if (!message) {
        // Use template based on tone
        const templates = {
          professional: 'Hi there - I am currently out of office and will return on {date}. I will be checking messages periodically but may be slow to respond.',
          casual: 'Hey! I am away right now but I will get back to you as soon as I return on {date}. Thanks!'
        };
        
        message = templates[oooStatus.tone];
        
        // Replace {date} with actual return date
        const endDate = new Date(oooStatus.endTime);
        const dateStr = endDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        message = message.replace('{date}', dateStr);
      }
      
      // Enable vacation responder
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
      
      console.log('✅ Gmail auto-responder ENABLED');
      console.log('📧 Message: ' + message);
    } else {
      // Disable vacation responder
      await gmail.users.settings.updateVacation({
        userId: 'me',
        requestBody: {
          enableAutoReply: false
        }
      });
      
      console.log('❌ Gmail auto-responder DISABLED');
    }
  } catch (error) {
    console.error('Error updating Gmail responder:', error);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting OOO Auto-Responder...\n');
  
  try {
    // Get authenticated
    const auth = await authorize();
    console.log('✅ Successfully authenticated with Google\n');
    
    // Check calendar
    console.log('📅 Checking your calendar...');
    const oooStatus = await checkOutOfOffice(auth);
    
    if (oooStatus.isOOO) {
      console.log('\n🏖️  You are currently OUT OF OFFICE!');
      console.log('   Event: ' + oooStatus.eventName);
      console.log('   Returns: ' + new Date(oooStatus.endTime).toLocaleString());
      console.log('   Tone: ' + oooStatus.tone);
    } else {
      console.log('\n💼 You are currently IN THE OFFICE');
    }
    
    // Update Gmail
    console.log('\n📧 Updating Gmail settings...');
    await updateGmailResponder(auth, oooStatus);
    
    console.log('\n✨ All done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
main();