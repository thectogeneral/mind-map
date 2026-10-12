import { domain, B, Q } from './lib';

/* ---------------- TRANSPORT AND LOGISTICS ---------------- */
const transport = domain({
  id: 'transport', p: 'tp', name: 'Transport and logistics', people: 'Riders and operators', blurb: 'From a single ride to a truck crossing a border.',
  forkText: 'Which part of moving people and goods are you drawn to?',
  branches: [
    B('tp', 1, 'Ride hailing and shared rides',
      ['What does a rider or driver do on a trip?', `Request a ride from a map|Book a seat in a shared car|Set a pickup point|Bid a fare with the driver|Accept trips as a driver|Split a fare with riders|Schedule a ride ahead|Share a trip with family|Pool a weekly commute|Call a ride by text or USSD|Rate the trip|Pay at the end`],
      ['What keeps drivers and riders coming back?', `Short waiting times|Lower fares than rivals|Predictable daily earnings|Trusted regular drivers|Rewards for frequent trips|Safe late-night rides|Fair commission for drivers|Quick payouts|Rides that fit the same route|Referral credit|Drivers who know the area|Women-only options`],
      ['Which features would the ride service have?', `Live map tracking|Fare estimate|Driver and rider ratings|In-app chat|Share trip with a contact|SOS button|Cash and wallet payment|Scheduled rides|Saved places|Driver document check|Surge price cap|Ride receipts|Pool matching|Offline booking by call|Trip history|Driver earnings screen`],
      ['What could set this ride service apart?', `One town or campus only|Women riders and drivers|Airport transfers|Tricycle and keke rides|Fixed-route shared taxis|School run pooling|Electric vehicles only|Cheaper fare for regulars|Drivers own the platform|Works without data|Rides for the elderly|Night shift workers`],
      ['What does the first ride look like?', `Open the map and see cars near you|Type a destination and get a fare|Pick a pickup point from suggestions|Confirm with a phone number only|See the driver photo and plate|Get a code to say at pickup|Watch the car approach|Share the trip in one tap|Receive a small first-ride credit|Rate the driver at the end|Receive a receipt by SMS|Driver sees the first request in seconds`, {
        adds: [
          { id: 'tp.b1.a', has: ['Bid a fare with the driver'], o: ['See driver counter offers', 'Accept the lowest bid', 'Agree a price before pickup'] },
          { id: 'tp.b1.a', has: ['Call a ride by text or USSD'], o: ['Dial a short code to book', 'Get the plate number by SMS', 'Reply with a pickup landmark'] },
        ],
        drops: [{ id: 'tp.b1.a', has: ['Call a ride by text or USSD'], o: ['Watch the car approach', 'Share the trip in one tap'] }],
      }],
      ['What would it need from outside?', `Map and routing data|A licence from the transport regulator|Vetted drivers|Vehicle owners as partners|Mobile money integration|An SMS gateway|Insurance cover|Phone number verification|Local fare tables|Driver background checks|Fuel station discounts|Ride credits from sponsors|Call centre staff|Car finance partners`, {
        adds: [{ id: 'tp.b1.c', has: ['Pool matching'], o: ['Route data from commuters', 'Employer partnerships', 'Park-and-ride points'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Call centre staff', 'Insurance cover', 'Car finance partners'] }],
      }],
      ['What must riders and drivers be able to trust?', `Drivers have passed identity checks|Fares are shown before the trip|The panic button reaches someone|Commission rules are clear|Location data stays private|Women have safety options|Complaints get a quick answer|Riders are insured|Cash handling is safe|The plate and photo match|Ratings cannot be faked|Local licensing rules are followed`, {
        adds: [{ id: 'tp.b1.c', has: ['SOS button'], o: ['Alert goes to police or a guard', 'Quiet alert option', 'Alert goes to a family member'] }],
      }]),
    B('tp', 2, 'Bus and transit ticketing',
      ['What does a passenger do at the ticket stage?', `Buy a ticket on the phone|Show a QR code to board|Tap a card on the bus|Top up a transit wallet|Buy a day pass|Pay the conductor by mobile money|Check bus arrival times|Plan a route with transfers|Reserve a seat on a long route|Buy a ticket by USSD|Scan at a terminal gate|Buy for a group`],
      ['What keeps passengers using it every week?', `Cheaper weekly passes|No cash to carry|Skipping queues at the terminal|Reliable arrival times|Loyalty points per trip|Refunds for cancelled trips|Seat guarantees|Employer-paid commute|Student fares|Free transfers within an hour|Receipts for expenses|Alerts about delays`],
      ['Which features would the ticketing app have?', `QR ticket|Seat map|Route search|Live bus location|Stored-value wallet|Weekly pass|Student and senior fares|Conductor scanner app|Offline ticket validation|Refund requests|Group booking|Delay alerts|Multi-language screens|Trip history|Operator dashboard|Printed ticket fallback`],
      ['What would make the ticketing specific?', `Intercity coaches only|Minibus routes with no stops|Campus shuttles|Ferry and water taxis|BRT lines|Cross-border buses|Church and event buses|Women-friendly seating|Works with feature phones|Cashless conductors|Operators in one park|Pay after boarding`],
      ['What does the first ticket purchase look like?', `Pick a route from a short list|See today's departures|Choose a seat on a map|Pay with mobile money|Get a QR code on screen|Get a ticket by SMS|Save the ticket for offline use|See a boarding reminder|Show the code to the conductor|See the balance left after boarding|Get a receipt in chat|Try one free demo trip`, {
        adds: [
          { id: 'tp.b2.a', has: ['Buy a ticket by USSD'], o: ['Dial and pick a route by number', 'Get a ticket code by SMS', 'Reply to confirm payment'] },
          { id: 'tp.b2.a', has: ['Tap a card on the bus'], o: ['Tap the card at the reader', 'Hear a confirmation beep', 'See the fare taken'] },
        ],
        drops: [{ id: 'tp.b2.a', has: ['Buy a ticket by USSD'], o: ['Choose a seat on a map', 'Get a QR code on screen'] }],
      }],
      ['What would it need from outside?', `Bus operator agreements|Fare tables from each route|GPS units on vehicles|Card readers or scanners|Mobile money integration|A bank card gateway|Regulator approval for fares|Station staff training|Printed cards|An SMS gateway|Route and stop data|Conductor smartphones|City transit authority data|A payment settlement partner`, {
        adds: [{ id: 'tp.b2.c', has: ['Live bus location'], o: ['Driver phones as trackers', 'Open transit data feed', 'Trackers fitted by owners'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['GPS units on vehicles', 'Card readers or scanners', 'Printed cards'] }],
      }],
      ['What must passengers and operators be able to trust?', `Tickets cannot be copied|Fares are shown clearly|Refunds actually arrive|Operator payouts come on time|Passenger data stays private|The conductor cannot skip the scan|Wallet balances are handled safely|Arrival times are accurate|Fare rules match the regulator|Every sale has a receipt|Resold tickets are checked|Boarding information is accessible`, {
        adds: [{ id: 'tp.b2.c', has: ['QR ticket'], o: ['Codes rotate every minute', 'Screenshot copying is blocked', 'One scan per trip'] }],
      }]),
    B('tp', 3, 'Last-mile delivery',
      ['What happens in one delivery?', `Dispatch a rider to a parcel|Pick up from a shop|Confirm an address by landmark|Drop at a locker or pickup point|Collect cash on delivery|Hand over with a code|Re-attempt a missed drop|Batch parcels on one route|Photograph the drop-off|Call the customer on arrival|Return a parcel to the sender|Deliver within an hour`],
      ['What brings shops and customers back?', `Faster than the usual wait|Cheaper per parcel|Fewer failed deliveries|Reliable riders|Daily batches shops can plan around|Same-day cutoffs|Cash remitted quickly|Tracking customers trust|Volume discounts|Shops see everything in one place|Riders earn steadily|Free redelivery`],
      ['Which features would the delivery tool have?', `Address by landmark or pin|Rider assignment|Route batching|Proof of delivery photo|Delivery code|Cash on delivery tracking|Customer tracking link|WhatsApp status updates|Rider app with offline mode|Failed delivery reasons|Pickup point map|Price calculator by distance|Daily rider cash report|Returns flow|Merchant dashboard|Delivery slots`],
      ['What would make the delivery service specific?', `One estate or campus|Food and groceries only|Pharmacy runs|Documents and small parcels|Market traders' orders|Bicycle and motorbike riders|Evening delivery|Women riders|Parcels from social sellers|Rural villages|Fragile and cold items|Neighbour-to-neighbour drops`],
      ['What does the first delivery look like?', `A shop adds one parcel|The customer gets a tracking link|A rider receives the job|The rider sees a pin and a landmark note|The rider calls ahead|The customer reads a delivery code aloud|The rider takes a drop photo|Cash is recorded in the app|The shop sees a done tick|A small first-week discount applies|A summary arrives on WhatsApp|The customer rates the rider`, {
        adds: [
          { id: 'tp.b3.a', has: ['Drop at a locker or pickup point'], o: ['The customer gets a pickup code', 'The locker door opens on scan', 'An attendant checks ID'] },
          { id: 'tp.b3.a', has: ['Collect cash on delivery'], o: ['The rider enters the cash amount', 'The customer sees a cash receipt', 'The shop gets a remittance note'] },
        ],
        drops: [{ id: 'tp.b3.a', has: ['Drop at a locker or pickup point'], o: ['The rider calls ahead', 'The rider sees a pin and a landmark note'] }],
      }],
      ['What would it need from outside?', `A pool of riders|Motorbikes or bicycles|Mapping and geocoding|Merchant partners|A bank account for cash handling|Mobile money for payouts|Insurance for parcels|Packaging supplies|Pickup point hosts|A courier licence|SMS or WhatsApp messaging|Riders' phones with data|Sorting space|Fuel or charging partners`, {
        adds: [{ id: 'tp.b3.c', has: ['Pickup point map'], o: ['Shop owners as hosts', 'Kiosk partnerships', 'Storage shelves'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Packaging supplies', 'Sorting space', 'Insurance for parcels'] }],
      }],
      ['What must customers and shops be able to trust?', `Parcels arrive intact|Riders are vetted before joining|Cash is remitted honestly|Customer addresses stay private|Losses are compensated clearly|Riders are paid fairly|Riders stay safe on the road|Delivery times are honest|Every handover has proof|Restricted items are refused|Customs and tax rules for parcels are met|Returns are handled fairly`, {
        adds: [
          { id: 'tp.b3.c', has: ['Delivery code'], o: ['Codes expire after use', 'Code resends are limited', 'Codes go by SMS only'] },
          { id: 'tp.b3.f', has: ['Insurance for parcels'], o: ['Claims are paid within a week', 'Cover limits are shown', 'Photos are required for claims'] },
        ],
      }]),
    B('tp', 4, 'Fleet management',
      ['What does the fleet manager do each day?', `Assign vehicles to drivers|Track vehicles on a map|Review fuel use|Log trips and mileage|Check driver behaviour|Schedule servicing|Approve expense claims|Plan routes for the day|Check licence and permit dates|Record incidents|Compare cost per vehicle|Lock or immobilise a vehicle`],
      ['What keeps owners checking it?', `Lower fuel bills|Fewer breakdowns|Drivers held to a clear record|A quick view each morning|Reports for the owner|Insurance discounts|Alerts before something goes wrong|Less time on paperwork|Stolen vehicle recovery|Tax-ready records|Resale value records|One view across many vehicles`],
      ['Which features would the fleet tool have?', `Live vehicle map|Trip history replay|Geofence alerts|Fuel log|Odometer capture|Service reminders|Driver scorecards|Document expiry alerts|Expense tracking|Incident report with photos|Job assignment|Speed alerts|Monthly cost report|Vehicle checklist|Driver app|Owner mobile view`],
      ['What would make the fleet tool specific?', `Ten vehicles or fewer|Tricycle fleets|Trucks on long haul|Company cars|Rental cars|Church and school buses|Ambulances|Water and gas tankers|Agricultural machinery|Phone tracking only, no hardware|Owners who live abroad|Fleets that hire out drivers`],
      ['What does the first day with the fleet tool look like?', `Add the first vehicle by plate|Import a list of vehicles|Invite drivers by phone number|See every vehicle on one list|Take a photo of the odometer|Set a service reminder|Draw a first geofence|Receive a first alert|See a one-line daily summary|Get a WhatsApp report|Record the first trip|Set a fuel budget`, {
        adds: [
          { id: 'tp.b4.a', has: ['Track vehicles on a map'], o: ['Place a tracker in a vehicle', "Use the driver's phone location", 'See the first moving dot'] },
          { id: 'tp.b4.a', has: ['Check licence and permit dates'], o: ['Photograph each document', 'Set expiry dates', 'Get an alert at 30 days'] },
        ],
      }],
      ['What would it need from outside?', `GPS trackers|Fuel sensors|OBD readers|Mobile data for devices|Maps and geocoding|An insurance partner|Mechanic partners|Vehicle registry data|Regulator licence data|Installer technicians|SIM cards|Mobile money payments|An SMS gateway|Cloud hosting`, {
        adds: [{ id: 'tp.b4.c', has: ['Driver scorecards'], o: ['Phone motion sensors', 'Telematics data from OBD', 'Driver coaching content'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['GPS trackers', 'Fuel sensors', 'Installer technicians', 'OBD readers'] }],
      }],
      ['What must owners and drivers be able to trust?', `Location data is seen only by the owner|Drivers know what is tracked|Records cannot be edited|Alerts are reliable|Tracker tampering is detected|Fuel theft leaves evidence|Data can be exported for audits|Remote immobilise is secure|Rules on tracking staff are followed|Drivers give clear consent|Tracking continues if the network drops|Staff have different access levels`, {
        adds: [
          { id: 'tp.b4.c', has: ['Driver scorecards'], o: ['Scoring rules are fair', 'Drivers can dispute a score', 'Scores are not tied to pay'] },
          { id: 'tp.b4.c', has: ['Live vehicle map'], o: ['Location is hidden off duty', 'Location is delayed for privacy', 'Only trips are tracked'] },
        ],
      }]),
    B('tp', 5, 'Freight and load matching',
      ['What happens in one load match?', `Post a load to find a truck|Find a load near the truck|Quote a price per trip|Book a truck for a date|Verify a driver and vehicle|Track a load on the road|Confirm pickup and delivery|Share a return load|Pay on delivery|Upload waybill photos|Negotiate with brokers|Split a truck between shippers`],
      ['What keeps shippers and truck owners returning?', `Trucks that do not return empty|Faster payment after delivery|Trusted shippers|Steady weekly loads|Fewer brokers taking a cut|Clear prices by route|Verified trucks|Less waiting at borders|Fuel advances|Records for lenders|Ratings both ways|Backhaul discounts`],
      ['Which features would the freight board have?', `Load posting|Truck availability board|Price per route guide|Quote requests|Driver verification|Vehicle documents upload|GPS check-in|Proof of delivery photo|Payment hold until delivery|Waybill scanner|Load chat|Return load alerts|Broker accounts|Rating system|Load insurance add-on|Border wait updates`],
      ['What would make the freight board specific?', `Produce and agriculture loads|Construction materials|Cement and bags|Cold chain|Container haulage|Cross-border corridors|Small vans and pickups|Fuel tankers|Tipper trucks|Livestock|Cooperatives as users|Weekend market runs`],
      ['What does the first load look like?', `A shipper posts a first load|A truck owner lists a vehicle|Quotes arrive within minutes|A route price guide appears|Documents get uploaded|A driver gets verified by phone|Both sides confirm in chat|Payment is held|The driver checks in at pickup|A photo proves delivery|Payment is released|Both sides rate each other`, {
        adds: [
          { id: 'tp.b5.a', has: ['Share a return load'], o: ['See loads along the way back', 'Match within 20 km of the route', 'Accept a half-price backhaul'] },
          { id: 'tp.b5.a', has: ['Pay on delivery'], o: ['Agree cash terms upfront', 'Record the cash handover', 'Confirm receipt by code'] },
        ],
        drops: [{ id: 'tp.b5.a', has: ['Pay on delivery'], o: ['Payment is held', 'Payment is released'] }],
      }],
      ['What would it need from outside?', `A base of truck owners|Shipper accounts|An escrow or payment partner|A bank partner for advances|Driver licence checks|Vehicle registry checks|GPS or phone tracking|An insurance partner|Route and distance data|Border and customs data|Local agents who bring in trucks|Mobile money payouts|Warehouse partners|Fuel card partners`, {
        adds: [{ id: 'tp.b5.c', has: ['Border wait updates'], o: ['Customs agent contacts', 'Weighbridge data', 'Queue reports from drivers'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['An escrow or payment partner', 'A bank partner for advances', 'An insurance partner', 'Fuel card partners'] }],
      }],
      ['What must shippers and truck owners be able to trust?', `Payment is safe until delivery|Both sides have verified identities|Loads really exist|New accounts are checked for fraud|Damaged goods have clear rules|Broker fees are fair|Prices are honest|Documents are kept for audits|Axle load limits are respected|Cross-border permits are in order|Disputes are handled|Driver hours and rest are respected`, {
        adds: [
          { id: 'tp.b5.c', has: ['Payment hold until delivery'], o: ['Who releases the money is clear', 'Release comes after a photo', 'A dispute window of 24 hours'] },
          { id: 'tp.b5.f', has: ['An escrow or payment partner'], o: ['The holding account is licensed', 'Refund rules are published', 'Fees are disclosed upfront'] },
        ],
      }]),
    B('tp', 6, 'Parking and vehicle access',
      ['What does a driver or visitor do?', `Find a free space|Reserve a spot ahead|Pay for time used|Open a gate with a code|Scan a plate at entry|Rent out a private space|Pay a street attendant digitally|Extend parking from the phone|Register a visitor|Pay a monthly bay|Find the car again|Get an exit pass`],
      ['What keeps drivers and space owners using it?', `Cheaper than the street|A guaranteed space at work|No hunting for change|Extra income from an empty space|Safe parking they trust|Monthly passes|Visitors let in easily|Fines avoided with reminders|Estate dues bundled in|A quick exit with no queue|Receipts for claims|Valet or wash add-ons`],
      ['Which features would the parking app have?', `Parking map|Real-time availability|Reservations|Pay by mobile money|Plate recognition|Gate code for visitors|QR entry pass|Time extension|Monthly pass|Attendant app|Landlord dashboard|Overstay alerts|Car locator|Receipts|Event parking|Fines reminder`],
      ['What would make the parking service specific?', `Estates and gated communities|Market and mall lots|University campuses|Church car parks|Event days|Hospital visitors|Street parking with attendants|Airport long stay|Office basements|Motorcycle bays|Residential driveways|Port and truck parks`],
      ['What does the first booking look like?', `Open the map and see nearby spaces|Pick a space and a time|Pay with mobile money|Get a gate code|Arrive and scan a QR|The attendant sees the booking|See the time left|Get a reminder before time ends|Extend with one tap|Exit with no queue|Receive a receipt|Share the spot with a friend`, {
        adds: [
          { id: 'tp.b6.a', has: ['Rent out a private space'], o: ['Photograph the space', 'Set hours and a price', 'See the first booking request'] },
          { id: 'tp.b6.a', has: ['Scan a plate at entry'], o: ['A camera reads the plate', 'The plate is saved to the booking', 'The barrier lifts on a match'] },
        ],
        drops: [{ id: 'tp.b6.a', has: ['Pay a street attendant digitally'], o: ['Get a gate code', 'Arrive and scan a QR'] }],
      }],
      ['What would it need from outside?', `Parking space owners|Attendants and guards|Gate and barrier hardware|Plate recognition cameras|Mobile money payments|Maps and geofencing|Local council permits|Landlord associations|Signage and QR stickers|An SMS gateway|Estate management partners|Event organiser partners|Insurance for cars|Cloud hosting`, {
        adds: [{ id: 'tp.b6.c', has: ['Event parking'], o: ['Stadium partnerships', 'Church scheduling', 'Temporary lots'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Gate and barrier hardware', 'Plate recognition cameras', 'Insurance for cars'] }],
      }],
      ['What must drivers and owners be able to trust?', `Prices are fair and visible|Bookings are honoured|Plate data stays private|Attendants are paid properly|Council rules on street parking are followed|Receipts hold up|Cars are safe and damage is covered|Owners may really rent the space|Camera footage rules are clear|Double bookings are refunded|Availability is honest|Fines are handled lawfully`, {
        adds: [
          { id: 'tp.b6.c', has: ['Plate recognition'], o: ['How long plates are stored', 'Who can see plate photos', 'A privacy notice at the gate'] },
          { id: 'tp.b6.c', has: ['Reservations'], o: ['Cancel rules', 'No-show fees', 'Refund timing'] },
        ],
      }]),
    B('tp', 7, 'Vehicle maintenance and spare parts',
      ['What does a vehicle owner do here?', `Find a trusted mechanic|Book a service slot|Order a part by plate|Compare part prices|Check if a part is genuine|Log a service record|Get a repair quote|Request a mobile mechanic|Rent workshop time|Trade used parts|Scan a fault code|Track service intervals`],
      ['What keeps owners and mechanics coming back?', `Genuine parts at fair prices|Records that raise resale value|Mechanics they trust|Reminders before breakdowns|Fast delivery of parts|Warranty on repairs|Loyalty discounts|Credit for big repairs|Fewer overcharges|Mechanics earn steady jobs|Fleet discounts|Photos of work done`],
      ['Which features would the maintenance app have?', `Part lookup by plate or chassis|Genuine part check|Price comparison|Garage directory|Service booking|Quote requests|Repair photos|Service history log|Maintenance reminders|Mobile mechanic dispatch|Parts delivery tracking|Pay in instalments|Mechanic ratings|Used parts listings|Fault code reader link|Warranty record`],
      ['What would make the parts service specific?', `Motorbikes and tricycles|Commercial buses|Imported used cars|Trucks and heavy vehicles|Japanese brand parts|Tyres and batteries|Panel beaters|Electric vehicles|Roadside breakdown help|Auto electricians|Market sellers in one district|Fleet owners only`],
      ['What does the first search look like?', `Enter the plate or chassis number|Pick the car model|See the service history|Search for a part|See three prices near you|Check for a genuine mark|Chat with a seller or mechanic|Book a slot|Upload a photo of the fault|Receive a quote|Pay a deposit|Get a service reminder`, {
        adds: [
          { id: 'tp.b7.a', has: ['Scan a fault code'], o: ['Plug in a reader', 'See the code in plain words', 'Get likely causes'] },
          { id: 'tp.b7.a', has: ['Request a mobile mechanic'], o: ['Share your location', 'See the mechanic arrive on a map', 'Approve the quote on the spot'] },
        ],
        drops: [{ id: 'tp.b7.a', has: ['Trade used parts'], o: ['Check for a genuine mark'] }],
      }],
      ['What would it need from outside?', `Parts suppliers and importers|Garage partners|Mechanics who join|Chassis and part number databases|Courier partners|Mobile money payments|Credit partners for instalments|OBD readers|Warranty providers|Photos of real stock|Brand authorisation letters|Market sellers' catalogues|Mobile mechanic vans|Training for mechanics`, {
        adds: [{ id: 'tp.b7.c', has: ['Genuine part check'], o: ['Manufacturer codes', 'Barcode scanning', 'Importer verification'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['OBD readers', 'Mobile mechanic vans', 'Credit partners for instalments'] }],
      }],
      ['What must owners and mechanics be able to trust?', `Parts are genuine|Repair quotes are honest|Mechanics are verified|Warranties are honoured|Prices are not inflated|Reviews come from real customers|Counterfeit parts get reported|Oils and batteries are handled safely|Return rules are clear|Vehicle data stays private|Garage fees are fair|Roadworthiness standards are met`, {
        adds: [
          { id: 'tp.b7.c', has: ['Mechanic ratings'], o: ['Only paying customers can rate', 'Mechanics can reply', 'Fake reviews are removed'] },
          { id: 'tp.b7.f', has: ['Parts suppliers and importers'], o: ['Suppliers are checked', 'Authorisation is in writing', 'Faulty stock is taken back'] },
        ],
      }]),
    B('tp', 8, 'Road safety and driver training',
      ['What does a learner or driver do?', `Take a theory lesson|Practise mock tests|Book a driving lesson|Log supervised hours|Watch hazard clips|Report a dangerous spot|Track a safe driving score|Get a refresher before renewal|Learn road signs|Complete a company course|Pass a licence test|Get coached after an incident`],
      ['What keeps drivers learning?', `Passing the licence test|Lower insurance|Streaks of safe driving|Certificates employers value|Small rewards for safe trips|Fewer fines|Progress with an instructor|Family sees safe trips|Fleet bonuses|Badges for each module|Reminders to renew|Peer comparisons`],
      ['Which features would the safety app have?', `Road sign quiz|Mock licence test|Video lessons|Instructor booking|Lesson log book|Hazard perception clips|Driving score|Incident report|Route risk map|Certificate download|Parent view|Fleet safety dashboard|Voice lessons|Offline lessons|Local rules guide|Reminder to renew`],
      ['What would make the training specific?', `Learner drivers|Okada and motorbike riders|Truck and bus drivers|Delivery riders|School drivers|Parents of teens|Pedestrian safety for kids|Rural roads|Defensive driving|Night driving|Company drivers|Driving schools`],
      ['What does the first session look like?', `Choose a licence category|Take a five-question quiz|See where you stand|Watch a short hazard clip|Learn five road signs|Book a first lesson|Find a nearby instructor|Log the first practice hour|Report a dangerous bend|Earn a first badge|Share the score with a parent|Receive a study plan`, {
        adds: [
          { id: 'tp.b8.a', has: ['Practise mock tests'], o: ['Timed test mode', 'Wrong answers are explained', 'The pass mark is shown'] },
          { id: 'tp.b8.a', has: ['Track a safe driving score'], o: ['The phone starts a trip', 'Hard braking is flagged', 'A score appears after the trip'] },
        ],
        drops: [{ id: 'tp.b8.a', has: ['Complete a company course'], o: ['Find a nearby instructor', 'Book a first lesson'] }],
      }],
      ['What would it need from outside?', `Official licence test questions|Local road rules text|Driving instructors|Driving school partners|Hazard video footage|Crash and incident data|Insurance partners|Phone sensor access|Translation into local languages|A road safety agency|Employers who enrol drivers|Voice recordings for lessons|Examiners' feedback|Mapping of dangerous spots`, {
        adds: [{ id: 'tp.b8.c', has: ['Offline lessons'], o: ['Downloaded lesson packs', 'Audio-only lessons', 'Printable booklets'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Hazard video footage', 'Voice recordings for lessons', 'Insurance partners'] }],
      }],
      ['What must learners and employers be able to trust?', `Questions match the real test|Rules are up to date|Scores are not shared without consent|Scoring is fair|Incident reports are handled sensitively|Instructors are verified|Certificates are genuine|Children's data is protected|The app does not distract while driving|No pressure to drive unsafely|Local rules are accurate|Employer use of scores is explained`, {
        adds: [
          { id: 'tp.b8.c', has: ['Driving score'], o: ['Who sees the score', 'Scores never affect pay', 'Rules on phone use while driving'] },
          { id: 'tp.b8.c', has: ['Certificate download'], o: ['A certificate verification code', 'Employers can verify it', 'The expiry date is shown'] },
        ],
      }]),
    B('tp', 9, 'Motorbike taxi tools',
      ['What does a rider do through the day?', `Accept a ride request|Hail a rider nearby|Record earnings by trip|Pay for fuel and repairs|Keep a ledger for the day|Form a rider group|Hire a bike|Pay the bike owner weekly|Share a helmet|Report a theft|Join a stage queue|Book a rider for a delivery`],
      ['What keeps riders and owners using it?', `Daily earnings made visible|Fewer idle hours|Bike ownership within reach|A fair share with owners|Fuel credit|Safer rides|Support from fellow riders|Insurance cover|Trust from regular passengers|Cheap repairs|Loan repayment tracking|Fewer police stops`],
      ['Which features would the rider app have?', `Trip ledger|Daily earnings summary|Fuel log|Loan repayment tracker|Owner remittance report|Rider ID card|Passenger ride request|Stage queue board|Helmet check|Emergency alert|Repair fund|Group savings|Hire-purchase schedule|Rider ratings|Route notes|Police stop guide`],
      ['What would make the rider tools specific?', `Boda boda in Kampala and Nairobi|Okada in Lagos|Bike hire-to-own|Female riders|Rider cooperatives|Electric motorbikes|Campus riders|Delivery riders|Riders with no smartphone|Stage chairpersons|Bike owners with many riders|Rural routes`],
      ['What does a rider see on day one?', `Sign up with a phone number|Add a bike plate|Take a selfie for ID|Log the first trip with a tap|See the day's total|The owner gets a weekly report|Passengers see the rider ID|Join a stage group|Record the first fuel purchase|Receive a safety tip|Earn a small cash-in bonus|Share a trip link`, {
        adds: [
          { id: 'tp.b9.a', has: ['Pay the bike owner weekly'], o: ['Owner and rider agree a split', 'The weekly amount is tracked', 'Missed payments are flagged'] },
          { id: 'tp.b9.a', has: ['Join a stage queue'], o: ['Check in at the stage', 'See who is next', 'Swap places with a friend'] },
        ],
        drops: [{ id: 'tp.b9.a', has: ['Hire a bike'], o: ['Add a bike plate'] }],
      }],
      ['What would it need from outside?', `Bike owners|Rider unions or stages|Mobile money for payouts|Fuel stations|Loan providers|Insurance providers|Helmet suppliers|Mechanic partners|Rider ID verification|Government rider registers|Battery swap stations|Phone data bundles for riders|Local chairpersons|Savings groups`, {
        adds: [{ id: 'tp.b9.c', has: ['Rider ID card'], o: ['Printed cards', 'A national ID check', 'A union stamp'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Loan providers', 'Insurance providers', 'Battery swap stations'] }],
      }],
      ['What must riders be able to trust?', `Rider data stays private|Loans are explained plainly|Deductions from earnings are fair|Riders stay safe during a trip|Passenger ratings are honest|Owners cannot cut a rider off unfairly|Stolen bikes get reported|Fuel prices are honest|Helmet rules are respected|Local transport bans are understood|Rider IDs are genuine|Savings are protected`, {
        adds: [
          { id: 'tp.b9.c', has: ['Loan repayment tracker'], o: ['Interest is shown plainly', 'Late payment rules are clear', 'The rider can see the contract'] },
          { id: 'tp.b9.c', has: ['Emergency alert'], o: ['The alert goes to the stage group', 'The alert goes to a family member', 'The alert shares the last location'] },
        ],
      }]),
    B('tp', 10, 'School and staff transport',
      ['What does the school transport lead do?', `Mark a pupil on the bus|Notify parents at pickup|Plan the morning route|Assign seats|Track the bus|Collect monthly fees|Register staff shuttle seats|Record absentees|Inform parents of delays|Check driver credentials|Log boarding by tag or scan|Handle a substitute driver`],
      ['What keeps schools and parents using it?', `Parents see the bus arrive|Shorter routes for children|Fees collected on time|Fewer lost children|Staff arrive on time|Drivers are held accountable|Fewer calls to the office|Reduced fuel cost|Safety checks done daily|Less admin for schools|Parents can swap days|A trusted driver every day`],
      ['Which features would the school transport app have?', `Pupil roster|Route planner|Live bus map|Boarding scan|Parent alerts|Absence note|Fee tracker|Driver app|Daily vehicle checklist|Staff shuttle booking|Delay broadcast|Emergency contacts|Substitute driver notice|Attendance report|Seat plan|Term calendar`],
      ['What would make the school transport specific?', `Primary schools|Boarding school runs|Church school buses|Staff shuttles for offices|Hospital shift workers|Special needs transport|Factory workers|University hostels|Parent-run carpools|Rural school pickup points|Small private schools|Bus operators serving many schools`],
      ['What does the first school day look like?', `The school uploads a roster|Parents are invited by phone|The driver gets the route|The pupil is ticked at pickup|The parent gets a message|The bus appears on a map|The driver notes a delay|The pupil is ticked at drop-off|The school office sees a daily report|The parent confirms receipt|A fee reminder arrives|Staff book a seat for tomorrow`, {
        adds: [
          { id: 'tp.b10.a', has: ['Log boarding by tag or scan'], o: ['A child taps a tag', 'The driver scans a card', 'A missing tap is flagged'] },
          { id: 'tp.b10.a', has: ['Register staff shuttle seats'], o: ['Staff pick days', 'A waitlist for full runs', 'Cancel the evening before'] },
        ],
        drops: [{ id: 'tp.b10.a', has: ['Register staff shuttle seats'], o: ['The pupil is ticked at pickup', 'The parent confirms receipt'] }],
      }],
      ['What would it need from outside?', `School administrators|Parents' phone numbers|Bus operators|Driver details and licences|GPS units or driver phones|Card or tag readers|Mapping data|An SMS gateway|A WhatsApp business account|Mobile money for fees|Local education authority rules|Insurance cover|Fuel suppliers|Employer partners`, {
        adds: [{ id: 'tp.b10.c', has: ['Boarding scan'], o: ['Paper tag printing', 'Reader devices', 'A tablet at the bus door'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Card or tag readers', 'GPS units or driver phones', 'Insurance cover'] }],
      }],
      ['What must schools and parents be able to trust?', `Children's data is protected|Only approved adults collect a child|Driver checks are done|Parents hear quickly about any incident|Location is shared only with parents|Records are kept for the school|Safety rules cover each vehicle|Staff data stays private|Fee records are accurate|Arrival times are accurate|Emergency steps are clear|Tracking children needs consent`, {
        adds: [
          { id: 'tp.b10.c', has: ['Live bus map'], o: ['Parents see only their bus', 'Location is delayed by a minute', 'The map hides home addresses'] },
          { id: 'tp.b10.c', has: ['Parent alerts'], o: ['Alerts go by SMS', 'There are quiet hours', 'An emergency override exists'] },
        ],
      }]),
    B('tp', 11, 'Shipment tracking',
      ['What does someone do to follow a shipment?', `Enter a tracking number|Scan a parcel|Follow a container|Get status by SMS|Share a link with a customer|Update a status from the road|Upload a delivery photo|Set a delivery notification|Combine several carriers|Check customs hold status|Track a courier bag|Receive an arrival alert`],
      ['What keeps senders and receivers checking?', `Fewer calls asking where it is|Customers trust the updates|One screen for many carriers|Early warning of delays|Proof of delivery stored|Faster claims|Less time spent chasing|Better planning for stock|A branded tracking page|Fewer lost parcels|A weekly performance report|Notifications in a local language`],
      ['Which features would the tracking tool have?', `Tracking number search|Barcode scan|Status timeline|SMS updates|WhatsApp updates|Branded tracking page|Carrier connection|Delay alerts|Proof of delivery|Bulk upload of shipments|Map of the route|Exception list|Customer notifications|Estimated arrival|Claims button|Weekly report`],
      ['What would make the tracking specific?', `Small online sellers|Courier companies|Importers of goods|Container shipping|Air cargo|Cross-border parcels|Church and charity shipments|Documents only|Diaspora parcels|Livestock and produce|One carrier only|Market sellers with no website`],
      ['What does the first lookup look like?', `Paste a tracking number|See a clear timeline|Subscribe to a text update|Scan a label with the camera|Add shipments in bulk|Get the first status change|Share the link with a buyer|See an estimated arrival|Get an alert on a delay|View the delivery photo|Rate the delivery|See all shipments in one list`, {
        adds: [
          { id: 'tp.b11.a', has: ['Combine several carriers'], o: ['Pick the carrier', 'Auto-detect the carrier from the number', 'Merge statuses in one timeline'] },
          { id: 'tp.b11.a', has: ['Get status by SMS'], o: ['Text the number to a short code', 'Receive a status reply', 'Stop updates by text'] },
        ],
        drops: [{ id: 'tp.b11.a', has: ['Get status by SMS'], o: ['Scan a label with the camera', 'Share the link with a buyer'] }],
      }],
      ['What would it need from outside?', `Carrier tracking feeds|Courier partners|Port and airline data|Customs system data|Scanners at depots|GPS devices|Barcode labels|An SMS gateway|A WhatsApp business account|Maps data|Warehouse partners|E-commerce platform plugins|Staff who update statuses by hand|Time zone and holiday data`, {
        adds: [{ id: 'tp.b11.c', has: ['Carrier connection'], o: ['Open carrier interfaces', 'Email parsing of carrier notices', 'Manual status entry'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Scanners at depots', 'GPS devices', 'An SMS gateway'] }],
      }],
      ['What must senders and receivers be able to trust?', `Statuses are accurate|Updates arrive in time|Shipper data stays private|Receiver contact details are protected|Status cannot change without a trace|Delay reasons are honest|Photo proof is real|Claim rules are clear|Customs data is handled carefully|Notifications need consent|It stays reliable when carriers are down|Time stamps can be trusted`, {
        adds: [
          { id: 'tp.b11.c', has: ['SMS updates'], o: ['Opt-in is required', 'Message cost is shown', 'A stop keyword works'] },
          { id: 'tp.b11.c', has: ['Proof of delivery'], o: ['Signature capture', 'Time and place stamp', 'Photos kept for 90 days'] },
        ],
      }]),
    B('tp', 12, 'Import, export and customs paperwork',
      ['What does a trader do with the paperwork?', `Classify goods with a code|Fill a customs form|Calculate duties and taxes|Upload an invoice|Check required permits|Track a clearing agent|Prepare an export pack|Check a restricted items list|Book an inspection|Pay duty through a bank|Store shipping documents|Get a document checklist`],
      ['What keeps traders coming back?', `Fewer delays at the port|Lower surprise fees|Documents ready in one place|Clearing agents who report back|The right duty on the first try|Fewer rejected forms|Alerts when rules change|Repeat orders get easier|Savings from the right tariff code|Peace of mind before shipping|Sharing files with partners|Export leads from compliance`],
      ['Which features would the paperwork tool have?', `HS code search|Duty and tax calculator|Document checklist by country|Invoice upload|Form auto-fill|Clearing agent directory|Status of a clearance|Permit finder|Restricted items check|Document vault|Exchange rate converter|Shared folder for partners|Rule change alerts|Template invoices|Cost estimate before shipping|Export pack builder`],
      ['What would make the paperwork tool specific?', `Small importers|Traders of used goods|Agricultural exporters|Online shoppers importing parcels|Diaspora senders|Handmade product exporters|Cross-border market traders|East African community trade|ECOWAS trade|Clearing agents|Manufacturers|First-time exporters`],
      ['What does the first customs check look like?', `Describe the goods in plain words|See a suggested code|Pick the country of origin|See the likely duty|Get a checklist of documents|Upload the invoice|Auto-fill a form|Share the pack with an agent|See a clearance status|Receive a rule change alert|Save a template for next time|Get a cost estimate before shipping`, {
        adds: [
          { id: 'tp.b12.a', has: ['Prepare an export pack'], o: ['Pick the destination market', 'See certificates needed', 'Attach a packing list'] },
          { id: 'tp.b12.a', has: ['Check required permits'], o: ['Pick the product type', 'See the issuing office', 'Set a reminder to renew'] },
        ],
        drops: [{ id: 'tp.b12.a', has: ['Store shipping documents'], o: ['Pick the country of origin'] }],
      }],
      ['What would it need from outside?', `Tariff schedules|Customs authority rules|Trade agreement data|Clearing agent partners|Bank partners for duty payment|Exchange rate feeds|Permit office information|Standards body certificates|Translations of forms|Lawyers or customs consultants|Freight forwarder partners|Document scanning|Port fee schedules|Country-specific updates`, {
        adds: [{ id: 'tp.b12.c', has: ['HS code search'], o: ['Official tariff books', 'Product descriptions from sellers', 'Past rulings'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Lawyers or customs consultants', 'Bank partners for duty payment', 'Document scanning'] }],
      }],
      ['What must traders be able to trust?', `Codes are correct|Duty estimates are close|Rules are up to date|It says plainly it is not legal advice|Documents are stored securely|Agents are checked for honesty|Fake agents are screened out|Permits are genuine|Business details are protected|Trade sanctions rules are followed|Reports hold up in a tax audit|Mistakes do not cause seizures`, {
        adds: [
          { id: 'tp.b12.c', has: ['Duty and tax calculator'], o: ['It shows how the figure is worked out', 'It gives a range, not a fixed figure', 'The date of the rates is shown'] },
          { id: 'tp.b12.c', has: ['Clearing agent directory'], o: ['Licence numbers are shown', 'Complaint records are visible', 'Traders write agent reviews'] },
        ],
      }]),
  ],
  peopleQs: [
    Q('tp.who', 'audience', 'Who is it for?', `Commuters|Drivers and riders|Small shop owners|Fleet owners|Truck owners|Schools and parents|Importers and exporters|Market traders|Students|Office workers|Delivery riders|Transport unions|City authorities|Online sellers`, 2,
      { adds: [
        { id: 'tp.sub', has: ['Ride hailing and shared rides'], o: ['Riders on late shifts', 'Women travelling alone', 'Visitors to the city'] },
        { id: 'tp.sub', has: ['Import, export and customs paperwork'], o: ['Clearing agents', 'First-time exporters', 'Diaspora senders'] },
      ] }),
    Q('tp.when', 'moment', 'When do they reach for it?', `Morning rush|Evening rush|Late at night|Before a trip|During a trip|Month end|Weekends|At the terminal|At the border|When a vehicle breaks down|Start of a school term|During rains and floods|Market days|During fuel shortages`, 2,
      { adds: [{ id: 'tp.b3.a', has: ['Deliver within an hour'], o: ['Lunch rush', 'Just before closing', 'During a promotion'] }] }),
    Q('tp.device', 'device', 'What phone or device do they use?', `A low-end Android|A mid-range Android|An iPhone|A feature phone|A shared phone|A tablet in a vehicle|A dashboard screen|A laptop in an office|A handheld scanner|A rugged phone|A smart watch|A phone with little data|A basic phone with USSD|A screen at a stop`, 2),
    Q('tp.lang', 'language', 'Which languages should it speak?', `English|Pidgin|Yoruba|Igbo|Hausa|Swahili|Luganda|French|Arabic|Portuguese|Amharic|Twi|Zulu|Icons and voice, little text`, 2),
    Q('tp.team', 'size', 'How big is the operation using it?', `One person|A family business|Five vehicles or fewer|Ten to fifty vehicles|A hundred or more|A single park or stage|A cooperative|A city network|A school with one bus|A multi-country firm|A franchise|A government agency`, 1,
      { depth: 'standard', drops: [{ id: 'tp.who', has: ['Small shop owners', 'Market traders'], o: ['A multi-country firm', 'A government agency', 'A franchise'] }] }),
    Q('tp.access', 'access', 'What access needs should it cover?', `Voice prompts|Large text|Works in bright sunlight|One-hand use|Low literacy support|Audio in local languages|Hands-free for drivers|Colour-blind safe|Wheelchair space information|Short USSD menus|Icons over words|Sign language video`, 3,
      { depth: 'deep',
        adds: [{ id: 'tp.b10.d', has: ['Special needs transport'], o: ['Ramp and lift details', 'Aide on board information', 'Quiet boarding times'] }],
        drops: [{ id: 'tp.device', has: ['A basic phone with USSD'], o: ['Sign language video', 'Audio in local languages'] }] }),
  ],
  shapeQs: [
    Q('tp.platform', 'platform', 'Where does it run?', `Android app|iOS app|Web browser|Installable web app|WhatsApp bot|USSD menu|SMS only|Driver tablet|Dashboard on a big screen|Desktop software|In-vehicle device|Kiosk at a terminal|Browser extension|Telegram bot`, 2,
      { adds: [
        { id: 'tp.sub', has: ['Fleet management'], o: ['Tracker box with a screen', 'Plug-in OBD device', 'Dashcam link'] },
        { id: 'tp.who', has: ['Truck owners'], o: ['Phone on the dashboard', 'Offline-first phone app', 'Rugged handheld'] },
        { id: 'tp.b2.d', has: ['Works with feature phones'], o: ['Light app under 10 MB', 'Ticket by SMS', 'Screen readable in the sun'] },
      ] }),
    Q('tp.ai', 'ai', 'What role could AI play?', `None|Predicts arrival times|Suggests the best route|Matches drivers to jobs|Prices a trip fairly|Reads documents and invoices|Flags fraud|Answers customer questions|Predicts breakdowns|Scores driver behaviour|Reads number plates|Translates messages|Summarises the day|Plans loads`, 2,
      { adds: [
        { id: 'tp.b12.a', has: ['Classify goods with a code'], o: ['Suggests the code from a photo', 'Explains a rule in plain words', 'Fills forms from an invoice'] },
        { id: 'tp.b7.a', has: ['Check if a part is genuine'], o: ['Reads part labels', 'Spots fake packaging', 'Compares photos to a catalogue'] },
      ] }),
    Q('tp.ui', 'interface', 'How do people interact with it?', `Big buttons|Map first|List first|Voice commands|Chat messages|Numbered menu|Scan and go|One screen only|Dashboard with charts|Swipe cards|Printed sheet plus phone|Notifications only`, 2,
      { depth: 'standard' }),
    Q('tp.session', 'session', 'How long does one use take?', `Under 10 seconds|About 30 seconds|One minute|Three minutes|Ten minutes|A few seconds many times a day|Once a day|Once a week|Runs in the background|A long trip|A month-end review|Event-based`, 1,
      { depth: 'standard', drops: [{ id: 'tp.platform', has: ['USSD menu'], o: ['Ten minutes', 'A long trip'] }] }),
    Q('tp.mode', 'matching', 'How do trips or jobs get matched?', `Nearest driver wins|Drivers bid|The operator assigns by hand|First to accept|Scheduled in advance|A rotating queue|Best rated first|The customer picks|Fixed routes with timetables|Shared in a pool|Brokers pass jobs on|Auto-batched by route`, 2,
      { depth: 'standard', when: { id: 'tp.sub', has: ['Ride hailing and shared rides', 'Freight and load matching', 'Last-mile delivery', 'Motorbike taxi tools'] } }),
    Q('tp.data', 'data', 'Where does the live data come from?', `Phone GPS|Driver entries|Customer entries|Tracker devices|Operator systems|Mapping providers|Government registers|Scans of documents|Mobile money records|Sensors in vehicles|Community reports|Partner feeds`, 3,
      { depth: 'deep',
        adds: [{ id: 'tp.b11.c', has: ['Carrier connection'], o: ['Carrier status pages', 'Port authority feeds', 'Airline cargo data'] }],
        drops: [{ id: 'y.budget', has: ['$0'], o: ['Tracker devices', 'Sensors in vehicles'] }] }),
  ],
  systemQs: [
    Q('tp.accounts', 'accounts', 'How do people sign in?', `Phone number and code|WhatsApp number|Email and password|Google login|Company login|National ID check|Driver licence check|Plate number only|Operator-created accounts|Guest with no account|Card or tag|Voice PIN|Biometric on the phone|Invited by a group admin`, 2,
      { adds: [{ id: 'tp.who', has: ['Transport unions'], o: ['Union member number', 'Branch codes', 'Dues status shown'] }] }),
    Q('tp.notify', 'notifications', 'What alerts would it send?', `Vehicle arriving|Driver assigned|Delay on the route|Payment received|Document about to expire|Service due|Low balance|New job nearby|Delivery done|Fuel spike|Route change|Safety warning|Daily summary|No alerts, pull only`, 3,
      { adds: [{ id: 'tp.b4.a', has: ['Check licence and permit dates'], o: ['Insurance renewal due', 'Road tax due', 'Roadworthiness test due'] }] }),
    Q('tp.offline', 'offline', 'How should it behave with poor signal?', `Works fully offline|Queues updates until signal|Cached maps|Text fallback|Low data mode|Syncs on Wi-Fi|USSD fallback|Compressed images|Retries payments safely|Tracks without data|Shows the last known position|Warns when data is stale`, 3,
      { adds: [{ id: 'tp.device', has: ['A low-end Android'], o: ['Runs on 1 GB RAM', 'App under 20 MB', 'No background drain'] }] }),
    Q('tp.pay', 'payments', 'How does money move through it?', `Mobile money|Card|Bank transfer|Cash recorded by the app|Airtime|A prepaid wallet|Pay on delivery|Pay after the trip|Escrow until done|Weekly settlement|Split payment|Fuel credit`, 2,
      { depth: 'standard',
        adds: [{ id: 'tp.b1.a', has: ['Split a fare with riders'], o: ['Each rider pays a share', 'The organiser collects', 'An absent rider is refunded'] }],
        drops: [{ id: 'tp.platform', has: ['SMS only'], o: ['Card', 'Escrow until done'] }] }),
    Q('tp.integ', 'integrations', 'What would it connect to?', `Mobile money wallets|Payment gateways|Google Maps|OpenStreetMap|WhatsApp Business|An SMS provider|Tracker vendors|Accounting software|Shopify or WooCommerce|Bank APIs|Customs systems|Insurance systems`, 3,
      { depth: 'standard', adds: [{ id: 'tp.b3.c', has: ['Merchant dashboard'], o: ['Shopify orders', 'Instagram shop orders', 'Excel upload'] }] }),
    Q('tp.admin', 'analytics', 'What would the owner see in reports?', `Earnings per day|Cost per kilometre|Trips completed|Late arrivals|Idle time|Fuel use|Cash owed|Driver ranking|Routes by profit|Complaints|A tax-ready summary|Export to spreadsheet`, 3,
      { depth: 'deep',
        adds: [{ id: 'tp.b4.a', has: ['Compare cost per vehicle'], o: ['Cost per vehicle per month', 'Spare parts cost', 'Insurance cost'] }],
        drops: [{ id: 'tp.team', has: ['One person'], o: ['Driver ranking', 'Routes by profit'] }] }),
    Q('tp.safety', 'safety', 'What safety tools would it include?', `SOS button|Trip sharing|Driver ID check|Plate check|A panic code at pickup|Speed warnings|Fatigue reminders|Safe stop suggestions|Incident reports|Block a user|Verified badge|Emergency contacts|Crash detection|A photo of the vehicle at pickup`, 3,
      { depth: 'deep', adds: [{ id: 'tp.b9.a', has: ['Report a theft'], o: ['Share bike photos', 'Alert nearby riders', 'Send to a stage chair'] }] }),
  ],
  growthQs: [
    Q('tp.money', 'money', 'How does it earn?', `Commission per trip|Monthly subscription|Per-vehicle fee|Per-shipment fee|Listing fees|Ads|Booking fee|Data and reports|Software licence|Pay per document|Payment fees|Premium support|Sponsored placement|Hardware margin`, 2,
      { adds: [
        { id: 'tp.sub', has: ['Fleet management'], o: ['Per-tracker monthly fee', 'Install fee', 'Insurance referral'] },
        { id: 'tp.b6.a', has: ['Rent out a private space'], o: ['Cut of rental income', 'Listing boost', 'Insurance upsell'] },
      ] }),
    Q('tp.price', 'pricing', 'How is it priced?', `Free for riders|Free for the first month|Per trip|Per vehicle per month|Per seat|Per shipment|Per document|Tiered by fleet size|Pay once|Local currency pricing|Pay by mobile money|Sponsor pays`, 1,
      { depth: 'standard', drops: [{ id: 'tp.team', has: ['One person', 'A family business'], o: ['Tiered by fleet size', 'Per seat'] }] }),
    Q('tp.first', 'first_users', 'How do the first 100 users find it?', `Friends and family|Union or stage leaders|WhatsApp groups|A single park or terminal|Church and club groups|Campus groups|Radio spots|Local influencers|Driver referrals|Market associations|Stickers on vehicles|Flyers at stages|Partnering with a company|Facebook groups`, 2),
    Q('tp.loop', 'loop', 'What makes users bring others in?', `Referral credit for drivers|Riders inviting friends|Shops inviting riders|Drivers inviting owners|Shared tracking links|Group bookings|Receipts that carry the brand|Stickers on vehicles|Operators bringing their drivers|Employers adding staff|Reviews that attract customers|Partners listing each other`),
    Q('tp.partner', 'partners', 'Which partners matter most?', `Unions|Transport companies|Banks|Mobile money operators|Insurers|Fuel companies|Telcos|Local government|Schools|Employers|Vehicle dealers|Logistics firms`, 2,
      { depth: 'standard', adds: [{ id: 'tp.b8.d', has: ['Driving schools'], o: ['Road safety agencies', 'Licensing offices', 'Insurance brokers'] }] }),
    Q('tp.go', 'expansion', 'How would you grow beyond the first area?', `The next neighbourhood|The next city|The next country|A new vehicle type|A new cargo type|Selling to operators|Selling to government|Licensing the software|Adding finance products|Adding insurance|Franchising to operators|Staying small on purpose`, 2,
      { depth: 'deep', adds: [
        { id: 'y.market', has: ['Nigeria'], o: ['Lagos first, then Abuja', 'Port Harcourt hub', 'Border towns'] },
        { id: 'tp.b5.d', has: ['Cross-border corridors'], o: ['Nairobi to Kampala', 'Lagos to Accra', 'Johannesburg to Harare'] },
      ] }),
  ],
  edgeQs: [
    Q('tp.belief', 'belief', 'What do you believe about transport that most builders do not?', `Trust beats price|Ordinary phones are enough|Owners need records more than drivers|Cash will remain|Operators will not change fast|Simple beats smart|Local routes beat maps|Drivers want fairness|Road data is worth money|Small fleets are ignored|Informal transport can be digitised|Trust spreads through groups`),
    Q('tp.kill', 'kill', 'Which outside condition would sink it?', `A regulator bans it|Fuel prices spike|Drivers refuse to use it|Unions block it|Mobile money fees rise|A global app expands locally|Data costs rise|Map data is inaccurate|Cash habits do not shift|A fraud scare hits trust|Vehicle supply dries up|Accidents hurt trust`, 1,
      { adds: [
        { id: 'tp.sub', has: ['Parking and vehicle access'], o: ['Council bans private bays', 'Gate hardware fails', 'Owners withdraw spaces'] },
        { id: 'tp.b5.a', has: ['Pay on delivery'], o: ['Payment disputes spiral', 'Escrow rules change', 'Brokers refuse digital payment'] },
      ] }),
    Q('tp.prior', 'prior', 'Why did earlier products like yours fade?', `Drivers saw no benefit|Hardware cost too much|Operators feared transparency|Cash leaked out|Apps ignored local routes|Commission was too high|No one maintained the data|Regulation changed|Poor network coverage|Support was missing|Trust never built|I do not know yet`),
    Q('tp.bench', 'bench', 'Which format is yours closest to?', `An Uber-style ride app|A Bolt-style fare bid|A FlixBus-style ticket app|A Jumia-style delivery network|A Samsara-style fleet tool|A Lori-style freight board|A Gojek-style super app|A Waze-style road tool|A Flexport-style trade platform|A ParkWhiz-style parking app|A DHL-style tracker|Nothing close, it is new`, 1,
      { depth: 'standard' }),
    Q('tp.moat', 'moat', 'What would be hard for others to copy?', `Driver trust|Route data|A union partnership|Exclusive operator contracts|Local payments know-how|A verified vehicle registry|A clean price history|A loyal rider group|Government relationships|A trusted brand mark|Hardware lock-in|Speed in a small area`, 2,
      { depth: 'deep', adds: [{ id: 'tp.money', has: ['Data and reports'], o: ['Proprietary route data', 'Price benchmarks', 'Industry reports'] }] }),
    Q('tp.reg', 'rules', 'Which rules matter most to you?', `Vehicle licensing|Driver licensing|Operating permits|Data protection law|Tax on digital services|Cross-border rules|Customs law|Road safety standards|Insurance requirements|Employment rules for drivers|Mobile money limits|Tracking and privacy rules`, 3,
      { depth: 'deep', adds: [{ id: 'tp.sub', has: ['Import, export and customs paperwork'], o: ['Trade agreement rules', 'Rules of origin', 'Sanctions lists'] }] }),
  ],
});

export default [transport];
