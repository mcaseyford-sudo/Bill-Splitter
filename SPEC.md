I want to build a mobile-friendly web app that splits restaurant bills. I'm a complete beginner, so explain each step in plain language before doing it, and tell me exactly what to run or click whenever something needs me.

TECH SETUP
- Frontend: React + Vite, designed mobile-first.
- Backend: one Cloudflare Worker with a POST /api/parse-receipt endpoint that calls OpenAI's gpt-4o-mini vision model. Serve the React app from the same Worker as static assets.
- The OpenAI API key must NEVER appear in frontend code. Store it as a Cloudflare secret, use a .dev.vars file for local development, and make sure .dev.vars and any .env files are in .gitignore.
- Initialize git, make an initial commit, and walk me through creating a GitHub repo and pushing to it. Commit after each working milestone.
- Store all money as integer cents, never floating-point dollars.

USER FLOW
1. Upload screen: a single "Take Photo / Upload Receipt" button (opens the camera on mobile). Resize the image in the browser to about 1600px on the longest side as a JPEG before uploading. Show a loading spinner while parsing.
2. Workspace (one screen):
   - Friends: a text input plus an Add button. Names appear as colored badges. Keep them in the order they were added.
   - Line items: each row shows price, item name, and an Assign button. Tapping the name or price lets me edit it. I can also add or delete items manually.
   - Assigning: the Assign button opens a bottom drawer with a checkbox for each friend. Selecting several people splits the item evenly.
   - Unassigned items are visually highlighted, and a banner shows "X items ($Y) not assigned yet."
   - Bill adjustments: tax, tip, discounts, and other fees, prefilled from the parse and editable. The tip field accepts either a dollar amount or a percentage of the subtotal (tips are often handwritten, so it may be missing from the parse).
   - Validation: compare the sum of the line items to the receipt subtotal. If they differ, show a warning with the difference.
   - Live totals card showing what each person owes, updating instantly.
   - A "Generate Summary for Group Chat" button.
3. Summary screen: hide all buttons and inputs. Show the bill total, then each person's total and their items, with shared items marked like "(split 3 ways)". It must fit on one phone screen for a screenshot. Include a Back button.

PARSING RULES (put these in the gpt-4o-mini system prompt and require a JSON-only response)
- Return: items [{name, price_cents, modifiers: [{name, price_cents}]}], subtotal_cents, tax_cents, tip_cents, discount_cents, fees_cents, total_cents. Use null for anything not on the receipt.
- Add-ons and modifiers (e.g. "+ bacon $1.00") roll into their parent item: line price = base price + modifiers. Show the modifier names under the item name (e.g. "Burger: + bacon, + avocado"). Zero-cost modifiers like "no onions" are just notes.
- Quantities: "2 x IPA $14.00" becomes separate line items, one per unit. If only the combined price is shown, divide it by the quantity and give any leftover cent to the first copy.
- Voided items: leave out the item and its void line entirely.
- Discounts, comps, and coupons: never attach them to individual items. Return them as one bill-level discount total.

SPLIT MATH
- Shared items: divide the price evenly among the assigned people, in cents. Leftover cents go to whichever of those people was added to the friend list first.
- Each person's food subtotal = the sum of their item shares.
- Bill-level adjustments (tax + tip + fees - discounts) are split proportionally to each person's food subtotal.
- Rounding: round each person's share down to the cent, then give all remaining cents to the first person in the friend list, so the per-person totals add up exactly to the bill total.
- Unassigned items are left out of per-person totals and shown separately.

UNASSIGNED ITEM FLAG
- If any items are unassigned when I tap Generate Summary, show a warning listing them, with "Go back and assign" and "Continue anyway" options. If I continue, the summary includes an "Unassigned: $X" line.

TODAY'S SCOPE
Set up the project and git/GitHub, then build the Workspace screen using hard-coded sample receipt data. The sample should include an item with a paid add-on, a "2 x" item, and a discount, so I can test the math. Make /api/parse-receipt a stub that returns that sample data. Do not connect OpenAI until I ask.