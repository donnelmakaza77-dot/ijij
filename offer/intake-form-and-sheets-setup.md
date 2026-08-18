# The Regulars Engine — Intake Form & Sheets Setup

Click-by-click build for the Google Form that sits behind every message in
`grand-slam-offer-and-outreach.md`, plus the Sheet that tracks what comes out of it.

Your buyer is an independent coffee shop owner filling this in on a phone, standing
up, probably between orders. Every decision below is made in service of that fact.

---

## PART 3 — THE FORM SPEC

**Form name:** `The Regulars Engine — Shop Details`
**Form description (shown under the title):**

> Four minutes and your club is in the build queue. If you'd rather just talk,
> reply to my email and we'll do it on the phone instead.

### Recommended build (9 questions)

| # | Section | Question text | Field type | Required? | Options / validation | Help text |
|---|---|---|---|---|---|---|
| — | 1. Your shop | *(section header)* | Section title | — | Title: **Your shop** | "The basics. Thirty seconds." |
| 1 | 1 | Your name | Short answer | **Yes** | None | *(none needed)* |
| 2 | 1 | Shop name | Short answer | **Yes** | None | "Exactly as you want it to appear on the rewards card." |
| 3 | 1 | Mobile number | Short answer | **Yes** | Regular expression → Matches → `^\+?[0-9][0-9\s\-()]{6,19}$` <br>Error text: "Digits only, and include your country code if you're outside the UK, like +44 7700 900123." | "UK mobiles are fine as 07700 900123. Outside the UK, start with your country code." |
| 4 | 1 | Best way to reach you | Multiple choice | **Yes** | WhatsApp / Text / Phone call / Email | "I'll use this one and leave the others alone." |
| 5 | 1 | Website or Instagram handle | Short answer | **Yes** | None | "Either is fine. This is where I pull your branding from, so give me whichever is more current." |
| — | 2. Your club | *(section header)* | Section title | — | Title: **Your club** | "What you want it to do for you." |
| 6 | 2 | What do you most want the club to do? | Checkboxes | **Yes** | • Turn one-off customers into regulars<br>• Win back people who stopped coming<br>• Finally have a list of my own customers<br>• Replace the paper stamp card<br>• See whether my offers actually work<br>• Get more Google reviews | "Tick everything that applies. It changes which campaigns I set up first." |
| 7 | 2 | When do you want to be live? | Multiple choice | **Yes** | • As soon as possible<br>• Within the next month<br>• Next quarter<br>• Just researching for now | "Go-live is 7 days from receiving your logo, so 'as soon as possible' is realistic." |
| 8 | 2 | Which suits you better? | Multiple choice | **Yes** | • **Pay for the year up front** (the better price)<br>• **Pay monthly**<br>• **I'm after something free or nearly free**<br>• Not sure yet, talk me through it | "The exact figures are in the message that sent you here. Nothing you pick is binding." |
| — | 3. Last bit | *(section header)* | Section title | — | Title: **Last bit** | — |
| 9 | 3 | Have you got a logo file ready? | Multiple choice | **Yes** | • Yes, I'll email it over<br>• Yes, but only as a JPG or a photo of my sign<br>• No, I haven't got one | "PNG or SVG is ideal. A photo of your sign genuinely works, so don't let this hold you up." |
| 10 | 3 | How did you hear about me? | Short answer | No | None | *(none needed)* |

Plus one automatic field: **Email address**, collected by the setting in step 5
below rather than as a question you build.

### What I cut from your list, and why

Your brief asked for eleven fields. I have built nine and a half. Here is every
cut and every risk, so you can overrule me with your eyes open.

| Your field | Verdict | Reasoning |
|---|---|---|
| Email address | **Cut as a question. Collected by setting instead.** | Turning on "Collect email addresses" already captures it with validation handled for you. Asking again is a duplicate field, a duplicate Sheet column, and the single easiest 30 seconds to save. |
| Full name | Changed to **"Your name"** | "Full name" makes people wonder if you need their legal name. You don't. |
| Brand / business name | **Kept, required** | Non-negotiable. It is the first thing you configure. |
| Phone number | **Kept, required** | This is your highest-drop-off field, and it is worth it. These owners answer WhatsApp and ignore email for four days. If you find yourself never calling, demote it to optional and you will recover completions. |
| Preferred contact method | **Kept, required** | Cheap to answer, four taps, and it stops you emailing someone who lives in WhatsApp. Best value-per-tap on the form. |
| Website or social handle | **Kept, required** | Doubles as your qualifier. No web presence at all is a signal about how this client will handle their side of the launch. |
| What they want delivered | **Kept, reframed as outcomes** | Deliberately worded as results, not features, so it echoes the offer sheet rather than asking a coffee shop owner to spec software. |
| Deadline | **Kept, as bands not a date** | A date picker on a phone is four taps and a wrong guess. Bands answer the only question you actually have: are they buying now. |
| Budget band | **Kept, reframed as plan shape, and deliberately price-free** | "What's your budget?" invites a lowball and raises abandonment. Asking which shape suits them gets a truer answer. It names no figures, for two reasons: you are running two price variants and one form has to serve both, and the price is already in the message that sent them here. "Free or nearly free" is the disqualifier, and it disqualifies under either variant. |
| Assets or files to send | **Cut the upload. Kept as a yes/no.** | **This is the important one.** A Google Forms file-upload question forces respondents to sign in to a Google account. Half your cold prospects are on Outlook or iCloud, and a sign-in wall mid-form is the highest-abandonment thing you can put in front of them. Ask whether they have a logo, then collect it by email reply. |
| How they heard about me | **Kept, optional** | Only useful once you run more than one channel. **If all your outreach is cold email and walk-ins, cut it entirely — you already know the answer.** |

### Drop-off risk, ranked

Assume roughly 5–8% of people who start abandon per extra field, worse on mobile,
and much worse at anything that feels like a commitment.

1. **File upload requiring Google sign-in — severe.** Cut, as above.
2. **Budget or plan choice — moderate to high.** Unavoidable and worth paying for.
   Mitigated by putting it after they have already invested six answers, and by
   framing it as choosing rather than confessing.
3. **Phone number — moderate.** Mitigated by help text that stops people worrying
   about format, and by an error message that tells them exactly what to fix.
4. **Anything open-ended — moderate.** Which is why only one field on this form
   asks for free text, and it is the optional one at the bottom.
5. **Sections — low, and net positive.** Three short screens read as easier than
   one long one, even though the work is identical.

**If you want it shorter still,** cut questions 4 and 10. You are then at seven
questions and you can still build the client's club. Do not cut 2, 5 or 8.

---

## Setup steps

### 1. Create and name the form

1. Go to **forms.google.com** and sign in.
2. Click **Blank form** (the `+` tile).
3. Click **Untitled form** at the top left and type: `The Regulars Engine — Shop Details`
   That renames the file. Then click the large **Untitled form** title on the form
   itself and type the same thing, since those are two separate labels.
4. Click **Form description** underneath and paste the description text from the spec above.
5. Click the palette icon at the top right, and set the theme colour to your own
   brand colour. The form is the first thing a client sees from you, so a default
   purple form undercuts the "looks custom-built" pitch you just made.

### 2. Add the questions

For each question in the spec table:

1. Click the **⊕** (Add question) button on the floating right-hand toolbar.
2. Type the question text into the **Question** field.
3. Open the **field-type dropdown** to the right of the question text and choose
   the exact type from the spec: `Short answer`, `Multiple choice`, or `Checkboxes`.
4. For `Multiple choice` and `Checkboxes`, click **Option 1** and type the first
   option, then press **Enter** to create the next one. Enter after each option is
   much faster than clicking "Add option" every time.
5. To add the help text, click the **⋮** (three dots) at the bottom right of the
   question card and tick **Description**. A second text box appears under the
   question. Paste the help text there.

**To add the three section headers,** click the **☰** icon (Add section, the bottom
icon on the right-hand toolbar) at the point where the new section should begin,
then type the section title and description. Build the questions in spec order and
insert each section break before its first question.

Order matters: name and shop first because they are effortless, plan choice at
number 8 once they are invested, optional free text last.

### 3. Turn on Required

1. Click each question card once to select it.
2. Toggle **Required** at the bottom right of the card.
3. Set **Required = on** for questions 1 through 9.
4. Leave **question 10 (How did you hear about me) off.** It is the only optional
   field, and keeping it optional is the point.

Quick check when you are done: only the last question should be missing a red
asterisk.

### 4. Response validation

**Email:** you do not need to set this. The setting in step 5 collects and
validates the address for you.

**Phone (question 3):**
1. Click the phone question card.
2. Click the **⋮** at the bottom right, and choose **Response validation**.
3. A row appears. Set the first dropdown to **Regular expression**.
4. Set the second dropdown to **Matches**.
5. In the pattern box, paste: `^\+?[0-9][0-9\s\-()]{6,19}$`
6. In **Custom error text**, paste: `Digits only, and include your country code if you're outside the UK, like +44 7700 900123.`

That pattern accepts `07700 900123`, `+44 7700 900123`, `(01234) 567890` and
`+353 86 1234567`, and rejects text and obvious junk. It is deliberately loose,
because a validation rule that rejects a real customer's real number costs you far
more than one that lets a typo through.

**If you ever add an email question by hand,** validation lives in the same menu:
**Response validation → Text → Email address**.

### 5. Settings: collect email addresses

1. Click the **Settings** tab at the top of the form editor.
2. Expand the **Responses** section.
3. Find **Collect email addresses** and set the dropdown to **Responder input**.

**Choose "Responder input", not "Verified".** Verified forces every respondent to
sign in to a Google account before they can submit. Independent shop owners on
Outlook, iCloud or a domain mailbox will hit that wall and leave. "Responder input"
adds a validated email field at the top of the form and asks nobody to log in.

4. While you are in **Responses**, turn **on** `Send responders a copy of their
   response`. Set it to **Always**. It costs nothing, it looks professional, and it
   gives the client a record of what they told you.
5. Leave **Allow response editing** off. You want to see what they said first time.

### 6. The confirmation message

1. Still in the **Settings** tab, expand **Presentation**.
2. Under **Confirmation message**, click **Edit**.
3. Paste this:

> Got it, thanks.
>
> Here's what happens next. I'll look at your website or Instagram and come back
> to you within one working day on the contact method you picked, with your go-live
> date and one page confirming what's included.
>
> One thing you can do now that speeds everything up: email me your logo, the best
> version you've got. PNG or SVG is ideal, a photo of your sign is genuinely fine.
> Send it to [YOUR EMAIL ADDRESS] and put your shop name in the subject.
>
> Nothing is committed at this stage, and nothing is charged until you've seen your
> club with your own branding on it.

4. Click **Save**.

Fill in your real email address before you publish. That line is the only
placeholder in either of these documents, and it is deliberate because I do not
know which address you want intake landing in.

Note what the message does: it sets a response-time expectation, it removes the
worry that submitting the form was a commitment, and it gives them one small task
while they are still keen. That last part is why the logo question earlier is a
yes/no rather than an upload.

### 7. Get the link and shorten it

1. Click **Publish** at the top right, then confirm the audience setting is
   **Anyone with the link**. A form restricted to your organisation will silently
   reject every cold prospect.
2. Click **Send**, then the **link icon** (🔗) in the dialog.
3. Tick **Shorten URL**.
4. Click **Copy**. You now have a `forms.gle/xxxxx` link.
5. Paste it into every `[FORM LINK]` in `grand-slam-offer-and-outreach.md`.

**Test it before you send anything.** Open the short link in a private browser
window, on your phone, and submit a real response as if you were a client. You are
checking three things: that it does not ask you to sign in, that the phone
validation accepts a normal UK mobile, and that the confirmation message reads
correctly on a narrow screen. Then delete that test response from the Sheet.

For the counter script, a `forms.gle` link is still awkward to read out loud. If
you own the domain, set up a redirect like `yourdomain.co.uk/start` pointing at the
short link, and put that on a card you hand over.

---

## PART 4 — CONNECT TO GOOGLE SHEETS

### Link the responses

1. In the form editor, click the **Responses** tab.
2. Click **Link to Sheets** (or the green Sheets icon at the top right of that tab).
3. Choose **Create a new spreadsheet**.
4. Name it `Regulars Engine — Client Pipeline`.
5. Click **Create**. The Sheet opens in a new tab with a tab named
   **Form Responses 1**.

Do this **before** you send the form out. Responses collected before linking do get
imported when you link, but starting clean avoids any doubt.

### Which columns appear, and in what order

With the settings above, the Sheet is created with these columns, left to right:

| Col | Header |
|---|---|
| A | Timestamp |
| B | Email Address |
| C | Your name |
| D | Shop name |
| E | Mobile number |
| F | Best way to reach you |
| G | Website or Instagram handle |
| H | What do you most want the club to do? |
| I | When do you want to be live? |
| J | Which suits you better? |
| K | Have you got a logo file ready? |
| L | How did you hear about me? |

Three things worth knowing about that block:

- **Timestamp is always column A** and is filled by Forms, not by the respondent.
- **Email Address is column B** only because you turned on "Collect email
  addresses". Without that setting, column B would be your first question.
- **Checkboxes questions produce one column, not several.** Question 8's multiple
  answers arrive in column H as a single comma-separated string, like
  `Turn one-off customers into regulars, Win back people who stopped coming`.
  Filtering on it needs a "text contains" filter, not "is equal to". This trips
  people up constantly.

### What happens when you change the form later

This is the part that quietly breaks people's tracking sheets, so read it before
you edit the form.

- **Adding a question** appends a new column immediately to the right of the last
  form-generated column. If you have put your own tracking columns there, they get
  **pushed right** to make room. Your data survives, but any formula or conditional
  formatting rule written against a hard-coded column letter now points at the
  wrong column.
- **Reordering questions in the form does not reorder the Sheet columns.** The
  existing columns stay exactly where they are, and new responses keep landing in
  them. Only the form looks different.
- **Deleting a question in the form does not delete its column or its data.** The
  column stays, and simply stops receiving new values.
- **Renaming a question does not reliably rename the existing column header.**
  Check the header after any edit and fix it by hand if needed.
- **New responses always append at the bottom.** If you sort the Sheet, the sort is
  a one-off and the next response lands underneath, out of order. Use
  **Data → Create a filter view** instead of sorting the sheet itself, so your view
  is yours and the underlying order stays intact.
- **Never insert a column inside the A–L block.** Forms writes by position.

**The safeguard:** leave **column M completely empty** as a spacer and start your
tracking columns at **N**. When Forms inserts a new question column it takes M, your
tracking shifts to O onwards intact, and you have one obvious empty column as the
boundary between "Forms owns this" and "I own this".

### The tracking layout

Leave M empty. Add these headers in row 1:

| Col | Header | Type | Notes |
|---|---|---|---|
| M | *(empty spacer)* | — | Do not use. This is the crumple zone. |
| N | **Status** | Dropdown | New → Contacted → Offer Sent → Paid → Live → Delivered, plus Lost and Nurture |
| O | **Offer Sent** | Date | |
| P | **Paid** | Date | |
| Q | **Go-Live** | Date | Their date, seven days after you have the logo |
| R | **Follow-up Date** | Date | The one column that drives your day |
| S | **Plan** | Dropdown | Annual / Monthly / Declined |
| T | **Price Variant** | Dropdown | `A` (£1,497/yr) or `B` (£99/mo) |
| U | **Notes** | Long text | Record any price objection in the client's own words. That is the pricing test's real output. |

**Build the Status dropdown:**
1. Select **N2:N1000**.
2. **Data → Data validation → Add rule**.
3. Criteria: **Dropdown**.
4. Add these eight values, and set a colour on each as you go:
   `New` (grey), `Contacted` (light blue), `Offer Sent` (light yellow),
   `Paid` (light green), `Live` (green), `Delivered` (dark green),
   `Nurture` (light orange), `Lost` (light red).
5. Under **Advanced options**, tick **Show a warning** rather than "Reject input",
   so a typo does not block you mid-flow.
6. Click **Done**.

Do the same for **column S** with the three Plan values, and for **column T** with
`A` and `B`.

**Fill in column T by hand as you send each message.** With ten shops you do not
need automation, and you already know which variant each one got. If you scale the
test past thirty, use a Google Forms **pre-filled link** instead: fill the form in
once, choose **Get pre-filled link** from the ⋮ menu, and it generates a URL that
pre-populates a field. Send the A link to one arm and the B link to the other, and
the variant records itself.

Dropdown chip colours give you most of the at-a-glance read on their own. The rules
below add the things a chip cannot show you: whole rows that need attention, and
dates that have passed.

### Conditional formatting rules

Select **A2:U1000** first, then **Format → Conditional formatting → Add another
rule** for each. Every rule below uses **Custom formula is**, and the `$` before
each column letter is what makes the whole row colour rather than a single cell.

| # | Rule | Formula | Formatting |
|---|---|---|---|
| 1 | Nothing done yet | `=$N2="New"` | Light grey background, bold text |
| 2 | Won, and paying | `=OR($N2="Paid",$N2="Live",$N2="Delivered")` | Light green background |
| 3 | Dead | `=$N2="Lost"` | Grey text, strikethrough, no fill |
| 4 | **Follow-up overdue** | `=AND($R2<>"",$R2<TODAY(),NOT(OR($N2="Paid",$N2="Live",$N2="Delivered",$N2="Lost")))` | **Red background, bold** |
| 5 | Follow-up today | `=$R2=TODAY()` | Orange background |
| 6 | Offer sent, gone quiet 7+ days | `=AND($O2<>"",$N2="Offer Sent",TODAY()-$O2>=7)` | Yellow background |
| 7 | Paid but not live yet | `=AND($P2<>"",$N2="Paid")` | Blue left border, or blue text |
| 8 | Budget disqualified | `=REGEXMATCH($J2&"","free or nearly free")` | Light red text, no fill |

**Rule order matters.** Google applies the first rule that matches and stops for
that property, so drag rule 4 to the top of the list. An overdue follow-up on a
"Contacted" row must beat every cosmetic rule below it. Rules 1 and 3 belong at the
bottom.

Rule 4 is the one that earns its keep. Set a Follow-up Date on every row you touch,
and the Sheet turns into a to-do list that tells you what is late without you
having to think. If you use one rule from this table, use that one.

Rule 8 flags the disqualifiers automatically so you can skip them in a glance
rather than re-reading the plan column. Note the `&""` in the formula, which stops
`REGEXMATCH` erroring on empty cells.

Finally, **freeze the header and the identifying columns** so the sheet stays
readable once you have forty rows: click any cell, then **View → Freeze → 1 row**,
and **View → Freeze → up to column D**. Now scrolling right to your tracking
columns keeps the shop name in view.

### Getting notified: pick one

**Use the Google Forms notification, not the Sheets notification rule.**

- **Forms:** Responses tab → **⋮** (three dots) → tick **Get email notifications
  for new responses**.
- **Sheets:** Tools → Notification settings → set a rule on the spreadsheet.

**Why Forms wins for this:**

1. **It is immediate.** Sheets notification rules are throttled and the "daily
   digest" option means a lead sits unread overnight. A shop owner who filled in
   your form at 4pm on a Tuesday is at peak interest at 4:05pm, not at 8am
   tomorrow.
2. **It tells you something.** The Forms email links you straight to the response.
   The Sheets email says a change was made to a spreadsheet, which you then have to
   go and open to find out anything at all.
3. **It cannot misfire.** A Sheets rule watches the file, so it fires when *you*
   edit a Status cell as well as when a client submits. You would be training
   yourself to ignore your own lead alerts within a week.
4. **One switch, no maintenance.** It survives every change you make to the form or
   the Sheet.

The only reason to prefer the Sheets rule is if you want alerts when a *collaborator*
changes something, which does not apply while you are the only person in here.

Turn the Forms notification on now, then submit one test response and confirm the
email arrives at the address you actually read on your phone. An intake alert going
to an address you check weekly is worse than no alert, because you will trust it.

---

## Assumptions in this document

1. **Your intake email address is unknown**, so `[YOUR EMAIL ADDRESS]` in the
   confirmation message is left for you to fill in. It is the only placeholder here.
2. **Google Forms UI labels** are as of the current interface. Google moves these
   controls occasionally, most often the Settings groupings and the Publish/Send
   buttons. If a label has moved, the setting still exists under the same name, so
   search the Settings tab for the wording in bold.
3. **Question 8 names no prices on purpose.** You are running two price variants
   against each other, and one form serving both cannot hard-code either. The
   figures live in the outreach message and on the offer sheet instead, and the
   variant each client saw is recorded in column T by hand.
4. **Nine questions assumes cold outreach to strangers.** For warm referrals, where
   completion is much less fragile, you can afford to add the file upload and a
   free-text "anything else I should know" field.
5. **A single-user pipeline is assumed.** If you bring anyone in to help with
   outreach, add an **Owner** column and switch the notification recommendation, as
   the Sheets rule becomes genuinely useful at that point.
