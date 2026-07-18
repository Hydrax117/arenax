# Requirements Document

## Introduction

ArenaX is a Progressive Web Application (PWA) built with Next.js targeting amateur eFootball Mobile (Konami) players in Nigeria. The platform enables players to discover tournaments, register to compete, submit match results, and receive prize payouts in Nigerian Naira via Paystack. Phase 1 covers a single game (eFootball Mobile), two tournament formats (Cup and League), phone-number OTP authentication, an admin dashboard for tournament management and result verification, and full PWA capabilities including offline support and push notifications. The design follows a futuristic dark theme with electric cyan and deep purple neon accents, glass-morphism cards, and Orbitron/Rajdhani geometric fonts optimised for mobile-first usage on Nigerian mobile data networks.

---

## Glossary

- **ArenaX**: The platform described in this document.
- **Player**: A registered user who browses tournaments, registers to compete, and submits results.
- **Admin**: The platform owner who creates tournaments, verifies results, and processes payouts.
- **Tournament**: A competitive event with a defined format, entry fee, prize pool, and participant limit.
- **Cup**: A single-elimination tournament format where losers are immediately eliminated.
- **League**: A round-robin tournament format where every participant plays every other participant.
- **Bracket**: The auto-generated match tree for a Cup tournament.
- **Fixture**: An auto-generated scheduled match between two participants in a League tournament.
- **League_Table**: The running standings (points, wins, draws, losses, goal difference) for a League tournament.
- **Result**: A match outcome consisting of a score and an optional screenshot submitted by a Player.
- **OTP**: A one-time password sent via SMS to verify a Nigerian phone number.
- **Paystack**: The payment gateway used for entry-fee collection and prize payouts.
- **Payout**: A prize transfer from the platform to a Player's Nigerian bank account.
- **PWA**: Progressive Web Application — a web app installable on Android and iOS home screens.
- **Service_Worker**: The background script that enables offline caching and push notifications for the PWA.
- **Push_Notification**: A message delivered to a Player's device via the Service_Worker even when the browser is closed.
- **Gamertag**: A Player's chosen display name on ArenaX.
- **eFootball_Username**: A Player's in-game name within the eFootball Mobile game.
- **Avatar**: A Player's profile image displayed on ArenaX.
- **Nigerian_State**: One of the 36 states (plus FCT) of Nigeria, selected during Player profile setup.
- **Entry_Fee**: The amount in Nigerian Naira a Player pays to register for a paid tournament.
- **Prize_Pool**: The total Naira amount distributed to winners of a tournament.
- **Slot**: One available participant position in a tournament.
- **Screenshot**: An image file uploaded by a Player as evidence of a match result.
- **Round**: A set of simultaneous fixtures within a bracket or league schedule.
- **Bye**: A free advancement granted to a Player when the bracket has an odd number of participants.

## Prize Pool Funding Model

- Prize pools are **admin-defined** — the admin sets the prize pool amount manually when creating a tournament.
- Entry fees collected from players are **separate** from the prize pool and held by the platform.
---

## Requirements

### Requirement 1: Phone Number OTP Authentication

**User Story:** As a visitor, I want to register and log in using my Nigerian phone number and a one-time password, so that I can access the platform without remembering a password.

#### Acceptance Criteria

1. THE ArenaX SHALL accept phone numbers in Nigerian formats for MTN, Airtel, Glo, and 9mobile networks (starting with 070, 080, 081, 090, 091).
2. WHEN a visitor submits a valid Nigerian phone number, THE ArenaX SHALL send an OTP via SMS to that number within 30 seconds.
3. WHEN a visitor submits an OTP that matches the issued code and has not expired, THE ArenaX SHALL create an authenticated session for that visitor.
4. IF an OTP is not used within 10 minutes of issuance, THEN THE ArenaX SHALL mark the OTP as expired and reject it.
5. IF a visitor submits an incorrect OTP, THEN THE ArenaX SHALL display an error message and allow the visitor to retry up to 3 times before requiring a new OTP request.
6. WHEN a visitor submits a phone number that does not match a Nigerian network prefix, THE ArenaX SHALL display a descriptive validation error and reject the submission.
7. WHEN an authenticated session expires, THE ArenaX SHALL redirect the Player to the login screen and preserve the URL the Player was attempting to access.

---

### Requirement 2: Player Profile

**User Story:** As a new Player, I want to create and manage my profile with my gamertag, avatar, Nigerian state, and eFootball username, so that other players and admins can identify me in tournaments.

#### Acceptance Criteria

1. WHEN a Player logs in for the first time, THE ArenaX SHALL prompt the Player to complete a profile before accessing tournament features.
2. THE Player_Profile SHALL include the following required fields: Gamertag (3–20 alphanumeric characters or underscores), eFootball_Username, and Nigerian_State.
3. THE Player_Profile SHALL include the following optional field: Avatar (image file, max 2 MB, JPEG or PNG).
4. WHEN a Player submits a Gamertag that is already in use by another Player, THE ArenaX SHALL display a uniqueness error and prompt the Player to choose a different Gamertag.
5. WHEN a Player updates their profile, THE ArenaX SHALL save the changes and reflect them across all tournament views within the same session.
6. THE Player_Profile SHALL display the Player's tournament history, including tournaments entered, wins, and total prize earnings in Naira.

---

### Requirement 3: Landing Page

**User Story:** As a visitor, I want to see an engaging landing page with featured tournaments and platform information, so that I understand what ArenaX offers and can quickly register or browse tournaments.

#### Acceptance Criteria

1. THE ArenaX SHALL display a hero section containing the ArenaX logo, a platform tagline, and call-to-action buttons for registration and tournament browsing.
2. THE ArenaX SHALL display a featured tournaments section showing up to 4 open tournaments with their title, prize pool, entry fee, available slots, and tournament format.
3. THE ArenaX SHALL display a "How It Works" section explaining the steps: register, join a tournament, play matches, submit results, and win prizes.
4. WHEN a visitor clicks a featured tournament card, THE ArenaX SHALL navigate the visitor to that tournament's detail page.
5. THE Landing_Page SHALL be fully rendered and interactive within 3 seconds on a 3G mobile connection.

---

### Requirement 4: Tournament Listing

**User Story:** As a Player, I want to browse all tournaments filtered by status, so that I can find open competitions to enter or track ongoing ones.

#### Acceptance Criteria

1. THE ArenaX SHALL display tournaments grouped by status: Open (registration available), Ongoing (in progress), and Completed (finished).
2. WHEN a Player selects a status filter, THE ArenaX SHALL display only tournaments matching that status within 500 milliseconds.
3. THE Tournament_Listing SHALL display for each tournament: title, format (Cup or League), prize pool, entry fee (or "Free"), registered participant count, total slot count, and start date.
4. THE ArenaX SHALL support pagination or infinite scroll displaying a maximum of 20 tournaments per page load.
5. WHEN no tournaments exist for a selected filter, THE ArenaX SHALL display a descriptive empty-state message.

---

### Requirement 5: Tournament Detail Page

**User Story:** As a Player, I want to view complete details about a tournament including the prize structure, format, registered players, and bracket or fixtures, so that I can make an informed decision to register and track competition progress.

#### Acceptance Criteria

1. THE Tournament_Detail_Page SHALL display: tournament title, game (eFootball Mobile), format (Cup or League), prize pool breakdown, entry fee, total slots, registered slot count, registration deadline, and start date.
2. WHEN a tournament status is Open, THE Tournament_Detail_Page SHALL display a registration call-to-action button.
3. WHEN a tournament status is Ongoing or Completed and the format is Cup, THE Tournament_Detail_Page SHALL display the auto-generated Bracket with match results populated where available.
4. WHEN a tournament status is Ongoing or Completed and the format is League, THE Tournament_Detail_Page SHALL display the auto-generated Fixture list and the League_Table sorted by points descending, then goal difference descending.
5. THE Tournament_Detail_Page SHALL display the list of all registered Players with their Gamertag and Avatar.

---

### Requirement 6: Tournament Registration

**User Story:** As a Player, I want to register for a tournament by paying the entry fee (if applicable), so that I can participate in the competition.

#### Acceptance Criteria

1. WHEN a Player clicks the registration button on a tournament with a zero entry fee, THE ArenaX SHALL register the Player immediately and confirm registration.
2. WHEN a Player clicks the registration button on a tournament with a non-zero entry fee, THE ArenaX SHALL initiate a Paystack payment flow for the Entry_Fee amount in Naira.
3. WHEN Paystack confirms a successful payment, THE ArenaX SHALL register the Player for that tournament and send a confirmation Push_Notification to the Player's device.
4. IF a Paystack payment fails or is cancelled, THEN THE ArenaX SHALL not register the Player and SHALL display a descriptive error message with an option to retry.
5. WHEN a tournament has no remaining Slots, THE ArenaX SHALL display the tournament as full and prevent further registrations.
6. WHEN a Player attempts to register for a tournament they are already registered for, THE ArenaX SHALL display an informational message and not create a duplicate registration.
7. WHEN the number of registered Players reaches the tournament's maximum Slot count, THE ArenaX SHALL automatically close registration.

---

### Requirement 7: Auto-Generated Cup Brackets

**User Story:** As a Player, I want the tournament bracket to be automatically generated when a Cup tournament starts, so that I can see my first-round opponent without manual intervention by an admin.

#### Acceptance Criteria

1. WHEN an Admin starts a Cup tournament, THE ArenaX SHALL generate a single-elimination Bracket by randomly seeding all registered Players into match positions.
2. WHEN the number of registered Players is not a power of two, THE ArenaX SHALL assign Byes to randomly selected Players so that the first round produces a number of winners that is a power of two.
3. THE Bracket SHALL display each match with the two competing Players' Gamertags (or "BYE") and a result input area.
4. WHEN a match Result is verified by an Admin, THE ArenaX SHALL automatically advance the winning Player to the next round and update the Bracket display.
5. WHEN all matches in a Round are completed, THE ArenaX SHALL generate the next Round's matches from the winners of the current Round.
6. WHEN a Player is assigned a Bye, THE ArenaX SHALL automatically advance that Player to the next Round without requiring a Result submission.

---

### Requirement 8: Auto-Generated League Fixtures and Table

**User Story:** As a Player, I want all league fixtures to be automatically generated when a League tournament starts, so that every player knows their full schedule from day one.

#### Acceptance Criteria

1. WHEN an Admin starts a League tournament, THE ArenaX SHALL generate a complete round-robin Fixture list using a balanced scheduling algorithm so that each Player faces every other Player exactly once.
2. THE Fixture_List SHALL display for each fixture: the two competing Players' Gamertags, the Round number, and the Result (pending or verified score).
3. WHEN a fixture Result is verified by an Admin, THE ArenaX SHALL update the League_Table by awarding 3 points for a win, 1 point for a draw, and 0 points for a loss.
4. THE League_Table SHALL display for each Player: position, Gamertag, matches played, wins, draws, losses, goals for, goals against, goal difference, and total points.
5. THE League_Table SHALL be sorted primarily by points descending, secondarily by goal difference descending, and tertiarily by goals for descending.

---

### Requirement 9: Result Submission

**User Story:** As a Player, I want to submit my match score and upload a screenshot, so that the admin can verify the result and update the standings.

#### Acceptance Criteria

1. WHEN a match is assigned to a Player and the tournament is Ongoing, THE ArenaX SHALL display a result submission form for that match on the Player's dashboard.
2. THE Result_Submission_Form SHALL require: the Player's score (non-negative integer), the opponent's score (non-negative integer), and an optional Screenshot (image file, max 5 MB, JPEG or PNG).
3. WHEN a Player submits a Result, THE ArenaX SHALL record the submission as pending and notify the Admin via Push_Notification.
4. WHEN both Players submit Results for the same match with matching scores, THE ArenaX SHALL mark the Result as auto-verified and update standings without requiring Admin intervention.
5. WHEN both Players submit Results for the same match with conflicting scores, THE ArenaX SHALL flag the match as disputed and notify the Admin for manual verification.
6. IF a disputed match has not been resolved by an Admin within 24 hours of being flagged, THEN THE ArenaX SHALL send a reminder Push_Notification and in-app alert to the Admin.
7. IF a Player submits a Result for a match that already has a verified Result, THEN THE ArenaX SHALL reject the submission and display an informational message.

---

### Requirement 10: Admin Dashboard — Tournament Management

**User Story:** As an Admin, I want to create and manage tournaments from a dedicated dashboard, so that I can run competitions without needing direct database access.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL be accessible only to users with the Admin role.
2. WHEN an Admin creates a tournament, THE ArenaX SHALL require the following fields: title, format (Cup or League), entry fee (0 for free), prize pool amount, prize distribution breakdown, maximum slot count, registration deadline, and start date.
3. WHEN an Admin submits a tournament creation form with a start date earlier than the registration deadline, THE ArenaX SHALL display a validation error and prevent creation.
4. WHEN an Admin clicks "Start Tournament" on a tournament that has met the minimum participant requirement, THE ArenaX SHALL generate the Bracket or Fixture_List and change the tournament status to Ongoing.
5. WHEN an Admin clicks "Start Tournament" on a tournament with fewer than 4 registered Players, THE ArenaX SHALL display an error and prevent the tournament from starting.
6. THE Admin_Dashboard SHALL display a list of all tournaments with their status, registered player count, and pending result count.

---

### Requirement 11: Admin Dashboard — Result Verification

**User Story:** As an Admin, I want to review and verify submitted match results including screenshots, so that standings are accurate and disputes are resolved fairly.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display all pending Results with the submitting Player's Gamertag, submitted scores, Screenshot (if provided), and submission timestamp.
2. WHEN an Admin approves a Result, THE ArenaX SHALL mark the Result as verified, update the Bracket or League_Table accordingly, and send a Push_Notification to both competing Players.
3. WHEN an Admin rejects a Result, THE ArenaX SHALL mark the Result as rejected, notify the submitting Player via Push_Notification with a reason, and re-open the result submission form for that match.
4. WHEN an Admin overrides a disputed Result with a manually entered score, THE ArenaX SHALL record the override, update standings, and notify both competing Players via Push_Notification.
5. THE Admin_Dashboard SHALL display disputed Results in a separate, highlighted section above pending Results.

---

### Requirement 12: Admin Dashboard — Player Management

**User Story:** As an Admin, I want to view and manage player accounts, so that I can handle account issues and maintain platform integrity.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a searchable list of all registered Players with their Gamertag, phone number, Nigerian_State, registration date, and tournament participation count.
2. WHEN an Admin searches by Gamertag or phone number, THE ArenaX SHALL return matching Players within 500 milliseconds.
3. WHEN an Admin suspends a Player, THE ArenaX SHALL prevent that Player from registering for new tournaments and display a suspension notice on the Player's account.
4. WHEN an Admin reinstates a suspended Player, THE ArenaX SHALL restore that Player's ability to register for tournaments.

---

### Requirement 13: Paystack Prize Payout Integration

**User Story:** As a Player, I want to receive my prize winnings directly to my Nigerian bank account via Paystack, so that I can access my earnings without leaving the platform.

#### Acceptance Criteria

1. WHEN a tournament is completed and winners are determined, THE ArenaX SHALL calculate each winner's prize amount based on the tournament's prize distribution breakdown.
2. WHEN an Admin initiates a payout for a winner, THE ArenaX SHALL require the winner's Nigerian bank account number and bank name before processing.
3. WHEN a Player has not saved bank details, THE ArenaX SHALL prompt the Player to add bank account details on their profile before a payout can be processed.
4. WHEN an Admin confirms a payout, THE ArenaX SHALL initiate a Paystack transfer to the winner's bank account and record the transaction reference.
5. WHEN Paystack confirms a successful transfer, THE ArenaX SHALL mark the payout as completed and send a Push_Notification to the winning Player with the transfer amount and bank details.
6. IF a Paystack transfer fails, THEN THE ArenaX SHALL mark the payout as failed, notify the Admin with the failure reason, and allow the Admin to retry the transfer.
7. THE Player_Profile SHALL display the Player's payout history including tournament name, amount, date, and status (pending, completed, or failed).

---

### Requirement 14: PWA Setup — Installability and Offline Support

**User Story:** As a Player, I want to install ArenaX on my Android or iOS home screen and access key pages without an internet connection, so that I can use the platform reliably on Nigerian mobile data networks.

#### Acceptance Criteria

1. THE ArenaX SHALL include a Web App Manifest with the app name, short name, icons (192×192 and 512×512), theme colour (near-black), background colour (near-black), and display mode set to "standalone".
2. THE Service_Worker SHALL cache the landing page, tournament listing page, and player profile page for offline access.
3. WHEN a Player accesses a cached page while offline, THE ArenaX SHALL serve the cached version and display an offline status indicator.
4. WHEN a Player attempts to perform a write action (register, submit result, pay) while offline, THE ArenaX SHALL display a descriptive error message explaining that an internet connection is required.
5. WHEN a browser that supports PWA installation displays the ArenaX, THE ArenaX SHALL trigger the browser's native install prompt.

---

### Requirement 15: PWA Setup — Push Notifications

**User Story:** As a Player, I want to receive push notifications for important events like tournament starts, match assignments, and payout completions, so that I stay informed even when the app is not open.

#### Acceptance Criteria

1. WHEN a Player completes profile setup, THE ArenaX SHALL request permission to send Push_Notifications to the Player's device.
2. THE ArenaX SHALL send a Push_Notification to a Player for each of the following events: tournament registration confirmed, tournament started (match/fixture assigned), match Result verified, disputed Result requiring Player action, and payout completed.
3. WHEN a Player taps a Push_Notification, THE ArenaX SHALL open or focus the app and navigate the Player to the relevant tournament or match page.
4. WHERE a Player has denied Push_Notification permission, THE ArenaX SHALL display in-app notification banners for the same events listed in criterion 2.
5. WHEN a Player disables Push_Notifications in their profile settings, THE ArenaX SHALL stop sending push messages to that Player's device and rely solely on in-app banners.

---

### Requirement 16: Futuristic Dark Theme and Mobile-First Design

**User Story:** As a Player, I want the ArenaX interface to have a futuristic dark aesthetic that is fast and easy to use on a mobile device, so that the experience feels premium and works well on Nigerian mobile networks.

#### Acceptance Criteria

1. THE ArenaX SHALL use a near-black primary background colour (#0A0A0F or equivalent), electric cyan (#00D4FF or equivalent) as the primary accent colour, and deep purple (#7B00FF or equivalent) as the secondary accent colour throughout the UI.
2. THE ArenaX SHALL use Orbitron for headings and Rajdhani for body text, loaded via a self-hosted or CDN font source.
3. THE ArenaX SHALL render card components using glass-morphism styling: semi-transparent background, backdrop blur, and a subtle neon border.
4. THE ArenaX SHALL be designed mobile-first with a minimum supported viewport width of 320px and all interactive touch targets meeting a minimum size of 44×44 CSS pixels.
5. WHEN a page transitions, THE ArenaX SHALL apply a smooth fade or slide animation lasting no more than 300 milliseconds.
6. THE ArenaX SHALL achieve a Lighthouse Performance score of 70 or above on mobile, measured in a simulated 3G environment.
