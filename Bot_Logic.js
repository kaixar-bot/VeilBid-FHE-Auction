require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { ethers } = require('ethers');

const token = process.env.TELEGRAM_BOT_TOKEN;
const rpcUrl = process.env.RPC_URL;

const bot = new TelegramBot(token, {polling: true});
const provider = new ethers.JsonRpcProvider(rpcUrl);

const userSessions = {};

console.log("🚀 VeilBid Bot is running in ENGLISH! (Ready for Global)");

// --- COMMAND 1: START ---
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcome = `
🎭 <b>Welcome ${msg.from.first_name} to VeilBid!</b>

This is a Privacy-Preserving Auction House powered by <b>FHE</b>.
All your bids are <b>ENCRYPTED</b> before reaching the Blockchain.

Available commands:
/connect_wallet - Create a wallet to bid
/bid [amount] - Place a sealed bid (e.g., /bid 500)
/help - Instructions
    `;
    bot.sendMessage(chatId, welcome, {parse_mode: 'HTML'});
});

// --- COMMAND 2: CONNECT WALLET ---
bot.onText(/\/connect_wallet/, async (msg) => {
    const chatId = msg.chat.id;
    const wallet = ethers.Wallet.createRandom();
    userSessions[chatId] = wallet;

    const info = `
✅ <b>Demo Wallet Created Successfully!</b>

📍 Address: <code>${wallet.address}</code>
🔑 Private Key: (Hidden for security)

Now you can try: <code>/bid 100</code>
    `;
    bot.sendMessage(chatId, info, {parse_mode: 'HTML'});
});

// --- COMMAND 3: BID (SIMULATION) ---
bot.onText(/\/bid (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const amount = match[1];

    if (!userSessions[chatId]) {
        bot.sendMessage(chatId, "⚠️ You don't have a wallet yet! Type /connect_wallet first.");
        return;
    }

    bot.sendMessage(chatId, `⏳ Encrypting <b>$${amount}</b> using Zama FHE technology...`, {parse_mode: 'HTML'});

    setTimeout(() => {
        bot.sendMessage(chatId, `
✅ <b>Bid Placed Successfully!</b>

💰 Actual Amount: <b>$${amount}</b> (Only you know this)
🔒 On-chain Data: <code>0x9a8b...f7c2</code> (Encrypted)
🔗 Tx Hash: <code>0x123456789abcdef</code>

No one (not even the Admin) knows your bid amount! 🤫
        `, {parse_mode: 'HTML'});
    }, 2000);
});
