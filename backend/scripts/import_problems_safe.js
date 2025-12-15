// scripts/import_all_companies.js
import mongoose from "mongoose";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";
import fetch from "node-fetch";
import Problem from "../src/models/Problem.js";

dotenv.config();

const companies = [
    "AMD", "AQR Capital Management", "Accenture", "Accolite", "Acko", "Activision", "Adobe", "Affirm", "Agoda", "Airbnb", "Airbus SE", "Airtel", "Airwallex", "Akamai", "Akuna Capital", "Alibaba", "Altimetrik", "Amadeus", "Amazon", "Amdocs", "American Express", "Analytics quotient", "Anduril", "Aon", "Apollo.io", "AppDynamics", "AppFolio", "Apple", "Applied Intuition", "Arcesium", "Arista Networks", "Asana", "Atlassian", "Attentive", "Audible", "Aurora", "Autodesk", "Avalara", "Avito", "Axon", "BILL Holdings", "BNY Mellon", "BP", "Baidu", "Bank of America", "Barclays", "Bentley Systems", "BharatPe", "BitGo", "BlackRock", "BlackStone", "Blizzard", "Block", "Bloomberg", "Bolt", "Booking.com", "Bosch", "Box", "Braze", "Brex", "Bridgewater Associates", "ByteDance", "CARS24", "CEDCOSS", "CME Group", "CRED", "CTC", "CVENT", "Cadence", "Canonical", "Capgemini", "Capital One", "Careem", "Cashfree", "Celigo", "Chewy", "Chime", "Circle", "Cisco", "Citadel", "Citigroup", "Citrix", "Clari", "Cleartrip", "Cloudera", "Cloudflare", "Coforge", "Cognizant", "Cohesity", "Coinbase", "Comcast", "Commvault", "Compass", "Confluent", "ConsultAdd", "Coupang", "Coursera", "Coveo", "Credit Karma", "Criteo", "CrowdStrike", "Cruise", "CureFit", "DE Shaw", "DP world", "DRW", "DXC Technology", "Darwinbox", "Databricks", "Datadog", "Dataminr", "Delhivery", "Deliveroo", "Dell", "Deloitte", "DeltaX", "Deutsche Bank", "DevRev", "Devsinc", "Devtron", "Directi", "Disney", "Docusign", "DoorDash", "Dream11", "Dropbox", "Druva", "Dunzo", "Duolingo", "EPAM Systems", "EY", "EarnIn", "Edelweiss Group", "Electronic Arts", "Epic Systems", "Expedia", "FPT", "FactSet", "Faire", "Fastenal", "Fidelity", "Fiverr", "Flexera", "Flexport", "Flipkart", "Fortinet", "Freecharge", "FreshWorks", "GE Digital", "GE Healthcare", "GSA Capital", "GSN Games", "Gameskraft", "Garmin", "Geico", "General Motors", "Genpact", "GoDaddy", "Gojek", "Goldman Sachs", "Google", "Grab", "Grammarly", "Graviton", "Groupon", "Groww", "Grubhub", "Guidewire", "Gusto", "HCL", "HP", "HPE", "HSBC", "Harness", "HashedIn", "Hertz", "HiLabs", "Highspot", "Hive", "Hiver", "Honeywell", "Hotstar", "Houzz", "Huawei", "Hubspot", "Hudson River Trading", "Hulu", "IBM", "IIT Bombay", "IMC", "INDmoney", "IVP", "IXL", "InMobi", "Indeed", "Info Edge", "Informatica", "Infosys", "Instacart", "Intel", "Intuit", "J.P. Morgan", "Jane Street", "Jump Trading", "Juniper Networks", "Juspay", "KLA", "Kakao", "Karat", "Komprise", "LINE", "LTI", "Larsen & Toubro", "Lendingkart Technologies", "Lenskart", "Licious", "Liftoff", "LinkedIn", "LiveRamp", "Lowe's", "Lucid", "Luxoft", "Lyft", "MAQ Software", "MSCI", "Machine Zone", "MakeMyTrip", "Mapbox", "Mastercard", "MathWorks", "McKinsey", "Media.net", "Meesho", "Mercari", "Meta", "Microsoft", "Microstrategy", "Millennium", "MindTree", "Mindtickle", "Miro", "Mitsogo", "Mixpanel", "Mobileye", "Moengage", "Moloco", "MongoDB", "Morgan Stanley", "Mountblue", "Moveworks", "Myntra", "NCR", "Nagarro", "National Instruments", "National Payments Corporation of India", "NetApp", "NetEase", "Netflix", "Netskope", "Netsuite", "Nextdoor", "Niantic", "Nielsen", "Nike", "NinjaCart", "Nokia", "Nordstrom", "Notion", "Nuro", "Nutanix", "Nvidia", "Nykaa", "OKX", "Odoo", "Okta", "Ola Cabs", "OpenAI", "Opendoor", "Optiver", "Optum", "Oracle", "Otter.ai", "Ozon", "Palantir Technologies", "Palo Alto Networks", "Patreon", "PayPal", "PayPay", "PayU", "Paycom", "Paytm", "Peloton", "PhonePe", "Pinterest", "Pocket Gems", "Point72", "Pony.ai", "Poshmark", "Postmates", "PubMatic", "Publicis Sapient", "Pure Storage", "Pwc", "QBurst", "Qualcomm", "Qualtrics", "Quora", "RBC", "Rakuten", "Reddit", "Remitly", "Revolut", "Riot Games", "Ripple", "Rippling", "Rivian", "Robinhood", "Roblox", "Roche", "Rokt", "Roku", "Rubrik", "SAP", "SIG", "SOTI", "Salesforce", "Samsara", "Samsung", "Scale AI", "Sentry", "ServiceNow", "ShareChat", "Shopee", "Shopify", "Siemens", "Sigmoid", "Slice", "Smartsheet", "Snap", "Snapdeal", "Snowflake", "SoFi", "Societe Generale", "Softwire", "Sony", "SoundHound", "Splunk", "Spotify", "Sprinklr", "Squarepoint Capital", "Squarespace", "StackAdapt", "Stackline", "Stripe", "Sumo Logic", "Swiggy", "Synopsys", "Tanium", "Target", "Tech Mahindra", "Tejas Networks", "Tekion", "Tencent", "Teradata", "Tesco", "Tesla", "Texas Instruments", "The Trade Desk", "Thomson Reuters", "ThoughtWorks", "ThousandEyes", "Tiger Analytics", "TikTok", "Tinder", "Tinkoff", "Toast", "Toptal", "Trexquant", "Trilogy", "Tripadvisor", "TuSimple", "Turing", "Turo", "Turvo", "Twilio", "Twitch", "Two Sigma", "UBS", "UKG", "USAA", "Uber", "UiPath", "Unity", "Upstart", "Urban Company", "VK", "VMware", "Valve", "Vanguard", "Veeva Systems", "Verily", "Veritas", "Verkada", "Vimeo", "Virtu Financial", "Virtusa", "Visa", "Walmart Labs", "Warnermedia", "WatchGuard", "Wayfair", "Waymo", "WeRide", "Wealthfront", "Wells Fargo", "Western Digital", "Whatnot", "WinZO", "Wipro", "Wise", "Wish", "Wissen Technology", "Wix", "Workday", "Works Applications", "WorldQuant", "X", "Yahoo", "Yandex", "Yelp", "Yext", "ZS Associates", "ZScaler", "Zalando", "Zendesk", "Zenefits", "Zepto", "Zeta", "Zillow", "ZipRecruiter", "Zluri", "Zoho", "Zomato", "Zoom", "Zoox", "Zopsmart", "Zynga", "athenahealth", "blinkit", "carwale", "ciena", "eBay", "fourkites", "instabase", "jio", "josh technology", "opentext", "oyo", "peak6", "persistent systems", "razorpay", "redbus", "smartnews", "tcs", "thoughtspot", "zeta suite"
];

const folderMap = {
    TCS: "tcs",
    oyo: "oyo",
    razorpay: "razorpay",
    blinkit: "blinkit",
    jio: "jio",
    carwale: "carwale",
    ciena: "ciena",
    fourkites: "fourkites",
    instabase: "instabase",
    redbus: "redbus",
    smartnews: "smartnews",
    thoughtspot: "thoughtspot",
    "zeta suite": "zeta suite"
};

const normalizeDifficulty = (d) => {
    const m = String(d || "").trim().toLowerCase();
    if (m.startsWith("e")) return "Easy";
    if (m.startsWith("m")) return "Medium";
    if (m.startsWith("h")) return "Hard";
    return "Unknown";
};

async function loadCsv(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const text = await res.text();
    return parse(text, { columns: true, skip_empty_lines: true });
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    await Problem.deleteMany({});
    console.log("Cleared existing problems");

    for (const company of companies) {
        const folder = folderMap[company] || company;
        const url = process.env.CSV_BASE_URL;

        console.log(`Importing ${company}...`);
        try {
            const rows = await loadCsv(url);
            let upserted = 0;

            for (const r of rows) {
                const title = (r.Title || r.Problem || r.problem || "").trim();
                const link = (r.Link || r.URL || r.Url || "").trim();
                const difficulty = normalizeDifficulty(r.Difficulty || r.Level || "");
                const topics = (r.Topics || r.Topic || "")
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);

                if (!title || !link) continue;

                const problemId = title
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");

                await Problem.updateOne(
                    { problemId },
                    {
                        $set: { title, url: link, difficulty, topics },
                        $addToSet: { companies: company },
                    },
                    { upsert: true }
                );

                upserted++;
            }

            console.log(`${company}: Upserted ${upserted}`);
        } catch (err) {
            console.error(`Error importing ${company}:`, err.message);
        }
    }

    await mongoose.disconnect();
    console.log("Done.");
}

main().catch((err) => {
    console.error(err);
    mongoose.disconnect();
});
