# LectroNote

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Login page as the landing page with two options: "Login with Class ID" and "Register New Class"
- Login with Class ID: form accepting a Class ID, on success shows the class dashboard
- Class Dashboard: displays class name at the top, followed by a monthly calendar
  - Selecting today's date: shows a "Record Class" option/button to add a new period/session for today
  - Selecting a past date: lists the periods/sessions held on that date, each with a bilingual summary (two languages) and a text-to-speech "Hear" button to listen to the summary
- Register New Class: form asking for class name and year, generates and displays a unique Class ID upon submission
- Period/session data model: class ID, date, period number, summary text (bilingual: primary language and a second language)
- Text-to-speech feature using Web Speech API for reading out bilingual summaries

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Backend (Motoko):
   - `Class` record: id (generated), name, year, created timestamp
   - `Period` record: id, classId, date (YYYYMMDD), periodNumber, summaryPrimary, summarySecondary
   - `registerClass(name, year)` -> returns generated classId
   - `loginClass(classId)` -> returns class info or error
   - `addPeriod(classId, date, periodNumber, summaryPrimary, summarySecondary)` -> saves period
   - `getPeriodsForDate(classId, date)` -> returns list of periods for that date

2. Frontend:
   - Route: `/` -> LoginPage with two tabs/buttons: Login | Register
   - Login form: Class ID input + submit
   - Register form: class name input + year input + submit -> show generated Class ID
   - After login: ClassDashboard page
     - Class name header
     - Calendar component (month view, navigable)
     - Today selected by default: show "Record Class" button -> opens form to add period (period number, primary summary, secondary summary)
     - Past date selected: list periods for that date with bilingual summaries and "Hear" button (Web Speech API TTS)
   - Responsive layout
