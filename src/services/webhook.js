const express = require('express');
const config = require('../config');
const db = require('../database');

module.exports = (bot) => {
    const app = express();
    app.use(express.json());

    // Debugging middleware: Log all incoming requests
    app.use((req, res, next) => {
        console.log(`[HTTP Request] ${req.method} ${req.url}`);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        next();
    });

    app.post('/webhook/sepay', (req, res) => {
        const apiKey = req.headers.authorization || '';
        
        // Verify API key if configured
        if (config.SEPAY_API_KEY && apiKey !== `Apikey ${config.SEPAY_API_KEY}`) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const data = req.body;
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const transactionId = data.id;
        const amount = data.transferAmount;
        const content = data.content || '';
        const transferType = data.transferType; // 'in' or 'out'

        // Only process incoming money
        if (transferType === 'in') {
            // Check if transaction was already processed
            const existingTx = db.prepare('SELECT id FROM transactions WHERE id = ?').get(transactionId);
            if (existingTx) {
                return res.status(200).json({ success: true, message: 'Transaction already processed' });
            }

            // Extract User ID from content (Format: "NAP 123456789")
            const match = content.match(/NAP\s*(\d+)/i);
            
            console.log(`[Webhook] Nhận giao dịch: ${amount}đ, Content: ${content}`);
            
            if (match && match[1]) {
                const userId = parseInt(match[1]);
                console.log(`[Webhook] Phát hiện nạp tiền cho user: ${userId}`);

                try {
                    // Check if user exists, if not create a basic profile
                    const userService = require('./userService');
                    const user = userService.findOrCreate({ id: userId, first_name: 'Khách', last_name: 'Hàng' });
                    
                    if (user) {
                        // Start transaction
                        const processTransaction = db.transaction(() => {
                            // Update user balance
                            db.prepare('UPDATE users SET balance = balance + ? WHERE telegram_id = ?').run(amount, userId);
                            
                            // Save transaction to prevent duplicates
                            db.prepare('INSERT INTO transactions (id, amount, user_id) VALUES (?, ?, ?)').run(transactionId, amount, userId);
                        });

                        processTransaction();

                        // Notify user
                        const newBalance = user.balance + amount;
                        bot.telegram.sendMessage(userId, 
                            `✅ <b>NẠP TIỀN THÀNH CÔNG</b>\n\n` +
                            `Hệ thống vừa ghi nhận giao dịch nạp tiền của bạn.\n` +
                            `💰 Số tiền cộng thêm: <b>+${amount.toLocaleString('vi-VN')}đ</b>\n` +
                            `💳 Số dư hiện tại: <b>${newBalance.toLocaleString('vi-VN')}đ</b>\n` +
                            `📝 Nội dung CK: <code>${content}</code>\n\n` +
                            `Cảm ơn bạn đã sử dụng dịch vụ!`, 
                            { parse_mode: 'HTML' }
                        ).catch(err => console.error('Lỗi gửi tin nhắn nạp tiền:', err.message));
                    }
                } catch (error) {
                    console.error('Webhook processing error:', error);
                }
            }
        }

        // Always return success for SePay
        return res.status(200).json({ success: true });
    });

    const port = config.WEBHOOK_PORT || 3000;
    app.listen(port, () => {
        console.log(`🌐 SePay Webhook Server is running on port ${port}`);
    });
};
