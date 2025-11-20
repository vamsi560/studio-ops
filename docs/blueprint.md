# **App Name**: BenchBoard

## Core Features:

- Excel Upload: Allow operations team to upload a new Excel file.
- Data Extraction & Processing: Extract data from specified columns in the uploaded Excel, handling VLOOKUP values.
- Duplicate Removal: Identify and remove duplicate resource entries from the current and previous uploads to maintain unique resource counts. Use uploaded spreadsheets as a tool, by making decisions about how and when they should update the resource lists.
- Bench Ageing Calculation: Calculate bench ageing based on Joining Date and categorize resources into 30-day (green), 60-day (orange), and 90-day (red) brackets.
- Dashboard Metrics: Display key metrics on a dashboard: Bench Ageing (color-graded), Skills, Grade, Internal Fulfillment, Client Rejections, Hiring Forecasting, and Upskilling Forecasting.
- Data Field Mapping: Map specific Excel columns (VAMID, Name, Joining Date, etc.) to corresponding fields in the application database.
- Real-time Updates: Incrementally update dashboard values based on new Excel uploads, reflecting changes without manual data entry.

## Style Guidelines:

- Primary color: Dark slate gray (#37474F) for a professional and clean look.
- Background color: Light gray (#ECEFF1), offering a subtle contrast against the primary color.
- Accent color: Deep orange (#FF7043) to highlight important metrics and interactive elements.
- Body and headline font: 'Inter' sans-serif font for clear, readable text and a modern, neutral feel.
- Use simple, monochrome icons for dashboard elements to maintain a professional aesthetic.
- Maintain a clean, well-organized layout with clear sections for each dashboard metric.
- Use subtle transitions and animations for loading data and updating dashboard metrics.