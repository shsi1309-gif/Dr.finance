const express = require('express');
const multer  = require('multer');
const path    = require('path');
const cors    = require('cors');
const fs      = require('fs');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
require('dotenv').config();

const supabase        = require('./db');
const processDocument = require('./ocrProcessor');
const sendEmailReport = require('./emailService');

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    credentials: false
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ── JWT ──
const JWT_SECRET = process.env.JWT_SECRET || 'drfinance_secret_change_in_production';

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token required.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// ── MULTER ──
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safeExt = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${Date.now()}${safeExt}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExts  = /\.(jpeg|jpg|png|pdf)$/i;
    if (allowedMimes.includes(file.mimetype) && allowedExts.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed!'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
}).single('payout_screenshot');

// =============================================================================
// AUTH ROUTES
// =============================================================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email and password are required.' });

        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        const cleanEmail = email.toLowerCase().trim();

        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (existing)
            return res.status(409).json({ message: 'An account with this email already exists.' });

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ name: name.trim(), email: cleanEmail, password: hashedPassword }])
            .select('id, name, email')
            .single();

        if (error) throw error;

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            token,
            user: { _id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Registration failed.' });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' });

        const cleanEmail = email.toLowerCase().trim();

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (error || !user)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            token,
            user: { _id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Login failed.' });
    }
});

// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const cleanEmail = email.toLowerCase().trim();
        const { data: user } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (!user) return res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });

        const crypto  = require('crypto');
        const token   = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate old tokens
        await supabase.from('password_reset_tokens').update({ used: true }).eq('user_id', user.id).eq('used', false);

        // Store new token
        const { error: tokenError } = await supabase
            .from('password_reset_tokens')
            .insert([{ user_id: user.id, token, expires_at: expires.toISOString() }]);
        if (tokenError) throw tokenError;

        const resetLink   = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        const nodemailer  = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"Dr. Finance AI" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Reset your Dr. Finance AI password',
            html: `
                <div style="background:#080808;padding:40px;font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;">
                    <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#f0ece4;margin-bottom:4px;">DR. FINANCE <span style="color:#d4a843;">AI</span></div>
                    <div style="font-size:11px;color:#444;letter-spacing:2px;font-family:monospace;margin-bottom:28px;">PASSWORD RESET</div>
                    <div style="background:#0f0f0f;border:1px solid #1a1a1a;border-radius:12px;padding:24px;margin-bottom:20px;">
                        <p style="color:#888;font-size:14px;margin-bottom:20px;">Hi ${user.name},<br><br>Click the button below to reset your password. This link expires in <strong style="color:#d4a843;">1 hour</strong>.</p>
                        <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#d4a843,#a07420);color:#000;font-weight:700;font-size:14px;border-radius:10px;text-decoration:none;">Reset My Password</a>
                    </div>
                    <p style="color:#333;font-size:12px;font-family:monospace;">If you did not request this, ignore this email.</p>
                    <div style="margin-top:20px;border-top:1px solid #1a1a1a;padding-top:16px;text-align:center;font-size:11px;color:#333;font-family:monospace;">Dr. Finance AI · Do not reply</div>
                </div>
            `
        });

        console.log(`📧 Reset email sent to ${user.email}`);
        res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });

    } catch (err) {
        console.error('Forgot password error:', err.message);
        res.status(500).json({ message: 'Failed to send reset email.' });
    }
});

// RESET PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Token and password are required.' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        const { data: resetToken } = await supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .maybeSingle();

        if (!resetToken) return res.status(400).json({ message: 'Invalid or expired reset link.' });
        if (new Date(resetToken.expires_at) < new Date()) return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });

        const hashedPassword = await bcrypt.hash(password, 12);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', resetToken.user_id);
        if (updateError) throw updateError;

        await supabase.from('password_reset_tokens').update({ used: true }).eq('id', resetToken.id);

        res.status(200).json({ message: 'Password reset successfully. You can now log in.' });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ message: 'Password reset failed.' });
    }
});

// =============================================================================
// TRANSACTION ROUTES
// =============================================================================

// GET ALL (scoped to logged-in user)
app.get('/api/transactions', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', req.userId)
            .order('date', { ascending: false });

        if (error) throw error;

        // Normalize field names to match what the frontend expects
        const normalized = (data || []).map(tx => ({
            _id:         tx.id,
            amount:      Number(tx.amount),
            recipient:   tx.recipient,
            description: tx.description,
            category:    tx.category,
            userEmail:   tx.user_email,
            dateTime:    tx.date_time,
            date:        tx.date,
        }));

        res.status(200).json(normalized);

    } catch (err) {
        console.error('Fetch error:', err.message);
        res.status(500).json({ message: 'Could not fetch data' });
    }
});

// UPLOAD & PROCESS
app.post('/api/upload', authenticate, (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError)
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        if (err)
            return res.status(400).json({ message: err.message });
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded!' });

        const filePath = req.file.path;
        const cleanup  = () => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); };

        try {
            console.log(`📂 Processing: ${req.file.filename} (${req.file.mimetype})`);

            const rawResult       = await processDocument(filePath);
            const transactionsArr = Array.isArray(rawResult) ? rawResult : [rawResult];

            const validTransactions = transactionsArr.filter(
                tx => tx && typeof tx.amount === 'number' && tx.amount > 0
            );

            if (validTransactions.length === 0) {
                cleanup();
                return res.status(400).json({ message: 'No valid transaction data found in the document.' });
            }

            const userEmail = (req.body.email || '').trim().toLowerCase();

            const docsToInsert = validTransactions.map(tx => ({
                user_id:    req.userId,
                date:       tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
                category:   (tx.category || 'Others').trim(),
                recipient:  tx.recipient ? tx.recipient.trim() : null,
                amount:     tx.amount,
                date_time:  tx.dateTime || null,
                user_email: userEmail || null,
            }));

            const { data: savedData, error: insertError } = await supabase
                .from('transactions')
                .insert(docsToInsert)
                .select();

            if (insertError) throw insertError;

            cleanup();

            // Send PDF report by email (non-blocking)
            if (userEmail && userEmail.includes('@')) {
                const { data: userRecord } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', req.userId)
                    .maybeSingle();

                sendEmailReport(userEmail, docsToInsert, userRecord?.name || '').catch(() => {});
            }

            res.status(200).json({
                message: `Successfully processed ${savedData.length} record(s).`,
                data: savedData
            });

        } catch (error) {
            cleanup();
            console.error('Processing Error:', error.message);
            res.status(500).json({ message: 'Processing failed', error: error.message });
        }
    });
});

// DELETE (owner only)
app.delete('/api/transactions/:id', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data)
            return res.status(404).json({ message: 'Transaction not found or not authorized.' });

        res.status(200).json({ message: 'Deleted successfully' });

    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).json({ message: 'Delete failed' });
    }
});

// =============================================================================
// AI FINANCIAL ADVISOR — SAVINGS + STOCK INVESTMENT RECOMMENDATIONS
// =============================================================================

// Stable blue-chip + growth NSE stocks for recommendation pool
const STOCK_POOL = [
    'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','ITC','SBIN',
    'BHARTIARTL','KOTAKBANK','LT','AXISBANK','ASIANPAINT','MARUTI','TITAN',
    'SUNPHARMA','BAJFINANCE','WIPRO','HCLTECH','TECHM','NESTLEIND',
    'POWERGRID','NTPC','ONGC','COALINDIA','JSWSTEEL','TATASTEEL',
    'DRREDDY','EICHERMOT','CIPLA','TATACONSUM','APOLLOHOSP','HEROMOTOCO',
    'BRITANNIA','INDUSINDBK','M&M','SBILIFE','HDFCLIFE','LTIM',
    'TATAMOTORS','DMART','PIDILITIND','SIEMENS','HAVELLS','MARICO',
    'DABUR','COLPAL','TRENT','BAJAJFINSV','BAJAJ-AUTO','DIVISLAB'
];

// Fetch current price + 1-month change for a symbol from Yahoo Finance
async function fetchStockData(symbol) {
    try {
        const ticker  = `${symbol}.NS`;
        const period2 = Math.floor(Date.now() / 1000);
        const period1 = period2 - 30 * 24 * 60 * 60;
        const url     = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1mo`;
        const r       = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!r.ok) return null;
        const data   = await r.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        const closes       = result.indicators?.quote?.[0]?.close?.filter(Boolean);
        const meta         = result.meta;
        if (!closes || closes.length < 1) return null;
        const currentPrice = closes[closes.length - 1];
        const startPrice   = closes[0];
        const changePercent = startPrice ? ((currentPrice - startPrice) / startPrice) * 100 : 0;
        return {
            symbol,
            name:           meta.longName || meta.shortName || symbol,
            currentPrice:   Math.round(currentPrice * 100) / 100,
            changePercent:  Math.round(changePercent * 100) / 100,
            peRatio:        meta.trailingPE ? Math.round(meta.trailingPE * 10) / 10 : null,
            marketCap:      meta.marketCap  || null,
            sector:         meta.sector     || 'N/A',
        };
    } catch { return null; }
}

app.post('/api/ai/advisor', authenticate, async (req, res) => {
    try {
        const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_KEY) return res.status(500).json({ message: 'AI not configured.' });

        const { monthlyIncome } = req.body;
        if (!monthlyIncome || isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0)
            return res.status(400).json({ message: 'Please provide your monthly income.' });

        const income = Number(monthlyIncome);

        // 1. Fetch user's last 30 days of transactions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, recipient, category, date')
            .eq('user_id', req.userId)
            .gte('date', thirtyDaysAgo.toISOString())
            .order('date', { ascending: false });

        if (error) throw error;
        if (!transactions || transactions.length === 0)
            return res.status(400).json({ message: 'No transactions found for last 30 days. Upload a recent statement first.' });

        // 2. Build spending summary
        const totalSpent = transactions.reduce((s, tx) => s + Number(tx.amount), 0);
        const surplus    = income - totalSpent;

        const catTotals = {};
        transactions.forEach(tx => {
            const cat = tx.category || 'Others';
            catTotals[cat] = (catTotals[cat] || 0) + Number(tx.amount);
        });
        const catBreakdown = Object.entries(catTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amt]) => `${cat}: ₹${Math.round(amt).toLocaleString('en-IN')} (${Math.round((amt/totalSpent)*100)}%)`)
            .join('');

        // 3. Fetch live stock data for a subset of the pool (20 stocks to stay fast)
        const shuffled   = STOCK_POOL.sort(() => 0.5 - Math.random()).slice(0, 20);
        const stockFetch = await Promise.allSettled(shuffled.map(fetchStockData));
        const stocks     = stockFetch
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value)
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, 10);

        const stockSummary = stocks.map(s =>
            `${s.symbol} (${s.name}): ₹${s.currentPrice}, 1M change: ${s.changePercent > 0 ? '+' : ''}${s.changePercent}%${s.peRatio ? `, PE: ${s.peRatio}` : ''}`
        ).join('');

        // 4. Build AI prompt
        const prompt = `You are an expert Indian personal finance advisor. Analyze the user's finances and give highly specific, actionable advice.

USER FINANCIAL PROFILE:
- Monthly Income: ₹${Math.round(income).toLocaleString('en-IN')}
- Total Spent This Month: ₹${Math.round(totalSpent).toLocaleString('en-IN')}
- Monthly Surplus: ₹${Math.round(surplus).toLocaleString('en-IN')} (${Math.round((surplus/income)*100)}% of income)
- Number of Transactions: ${transactions.length}

SPENDING BREAKDOWN:
  ${catBreakdown}

CURRENT TOP PERFORMING NSE STOCKS (Live Data):
  ${stockSummary}

Based on this data, provide a complete financial plan. Respond ONLY with this exact JSON (no markdown, no extra text):
{
  "savingsAdvice": {
    "currentSavingsRate": <number: % of income currently saved>,
    "recommendedSavingsRate": <number: ideal % to save>,
    "monthlySavingsAmount": <number: exact ₹ amount to save per month>,
    "emergencyFundTarget": <number: 6 months expenses in ₹>,
    "summary": "<2 sentence assessment of their savings situation>"
  },
  "cutSpendings": [
    { "category": "<category name>", "currentAmount": <number>, "suggestedAmount": <number>, "savingAmount": <number>, "reason": "<specific reason why and how to cut>" }
  ],
  "investmentPlan": {
    "monthlyInvestmentAmount": <number: ₹ to invest after savings>,
    "stocks": [
      {
        "symbol": "<NSE symbol from the stock list above>",
        "name": "<company name>",
        "currentPrice": <number>,
        "allocationPercent": <number: % of investment amount>,
        "allocationAmount": <number: exact ₹>,
        "sharesCanBuy": <number: floor of allocationAmount/currentPrice>,
        "reason": "<specific reason why this stock suits this user's profile>",
        "riskLevel": "Low|Medium|High"
      }
    ],
    "expectedMonthlyReturn": "<estimated % range>",
    "disclaimer": "Investments are subject to market risks. This is AI-generated advice, not SEBI-registered financial advice."
  },
  "overallScore": <number 1-10: financial health score>,
  "topPriority": "<single most important action the user should take this month>"
}`;

        // 5. Call AI with fallback models
        const FREE_MODELS = [
            'openrouter/free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'google/gemma-3-27b-it:free',
            'qwen/qwen3-8b:free',
        ];

        let aiData = null;
        let lastError = null;
        for (const model of FREE_MODELS) {
            const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
                    'X-Title': 'Dr. Finance AI'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1500,
                    temperature: 0.4
                })
            });
            if (!aiRes.ok) {
                lastError = await aiRes.text();
                console.warn(`Model ${model} failed:`, lastError);
                continue;
            }
            aiData = await aiRes.json();
            console.log(`AI advisor response from: ${model}`);
            break;
        }

        if (!aiData) {
            console.error('All AI models failed:', lastError);
            return res.status(502).json({ message: 'AI service unavailable. Please try again shortly.' });
        }

        const rawText = aiData.choices?.[0]?.message?.content || '';
        if (!rawText.trim())
            return res.status(502).json({ message: 'AI returned empty response. Try again.' });

        const jsonMatch = rawText.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return res.status(502).json({ message: 'AI response was not valid JSON. Try again.' });

        let parsed;
        try {
            parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error('JSON parse error:', e.message);
            return res.status(502).json({ message: 'Could not parse AI response. Try again.' });
        }

        // Attach live stock data used for transparency
        parsed.stockDataUsed = stocks;
        parsed.generatedAt   = new Date().toISOString();

        res.status(200).json(parsed);

    } catch (err) {
        console.error('AI advisor error:', err.message);
        res.status(500).json({ message: 'Advisor failed. Try again.' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));