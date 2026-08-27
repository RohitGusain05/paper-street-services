# Paper Street Services

A responsive website and order-management system for Paper Street Services.

## Brand
- Name: Paper Street Services
- Primary contact: WhatsApp
- Business email: paperstreetservicesco@gmail.com
- Design direction: premium editorial dark theme with deep red accents and natural green details, inspired by the supplied Paper Street tree/soul artwork.
- No tagline on the logo.

## Current public pricing
| Service | Price |
|---|---:|
| Dissertation | ₹1,500 |
| Project Report | ₹1,000 |
| ATS-Friendly Resume | ₹200 |
| Assignment | ₹200 |
| Practical File — All Practicals | ₹1,000 |
| Internship Report | ₹300 |
| Project Presentation PPT | ₹300 |
| Seminar Report | ₹300 |
| Website Building | ₹1,000 |
| Others | Discuss on WhatsApp |

## Customer flow
1. Customer chooses a service.
2. Name, WhatsApp number and service are required.
3. Deadline and design preferences can be supplied; file upload is optional.
4. Multiple reference files are supported.
5. Order is submitted and the customer continues the conversation personally through WhatsApp.

## Admin workflow
- New orders are separate from paid/in-progress work.
- Once an order is marked paid, active work is prioritized by earliest deadline.
- Deadline can be edited after communicating with the customer.
- Completed orders are retained for future reference with customer name, WhatsApp number and requested project/service.
- Completed orders can be deleted manually.
- Orders that are not paid in time can be removed manually.
- Customer-facing status updates are handled personally through WhatsApp.

## Security architecture
GitHub contains source code only. Customer documents, credentials and order records must not be committed to this repository. The planned production backend uses authenticated database access and private file storage.

## Build status
- Public website: initial implementation complete
- Responsive UI: initial implementation complete
- WhatsApp order handoff: initial implementation complete
- Admin UI: initial shell present
- Database schema: prepared in `supabase/schema.sql`
- Authentication, private storage, live database and production deployment: next stage
