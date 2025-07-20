const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for payment transactions
const transactions = [];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Payment service is running' });
});

// Process payment
app.post('/process-payment', async (req, res) => {
    try {
        const { amount, currency = 'USD', paymentMethod, orderId } = req.body;

        // Validate input
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid amount' 
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment method is required' 
            });
        }

        // Simulate payment processing
        const transactionId = uuidv4();
        const status = Math.random() > 0.1 ? 'success' : 'failed'; // 90% success rate

        const transaction = {
            id: transactionId,
            orderId,
            amount,
            currency,
            paymentMethod,
            status,
            timestamp: new Date(),
            processedAt: new Date()
        };

        transactions.push(transaction);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (status === 'success') {
            res.json({
                success: true,
                message: 'Payment processed successfully',
                transactionId,
                amount,
                currency,
                status
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment failed',
                transactionId,
                status
            });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get transaction status
app.get('/transaction/:id', (req, res) => {
    try {
        const transaction = transactions.find(t => t.id === req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get all transactions (for admin purposes)
app.get('/transactions', (req, res) => {
    try {
        res.json({
            success: true,
            transactions: transactions.slice(-50) // Last 50 transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Refund payment
app.post('/refund', async (req, res) => {
    try {
        const { transactionId, amount, reason } = req.body;

        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: 'Transaction not found' 
            });
        }

        if (transaction.status !== 'success') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot refund failed transaction' 
            });
        }

        // Simulate refund processing
        const refundId = uuidv4();
        const refundTransaction = {
            id: refundId,
            originalTransactionId: transactionId,
            amount: amount || transaction.amount,
            currency: transaction.currency,
            type: 'refund',
            status: 'success',
            reason,
            timestamp: new Date(),
            processedAt: new Date()
        };

        transactions.push(refundTransaction);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refundId,
            amount: refundTransaction.amount,
            status: 'success'
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Payment methods
app.get('/payment-methods', (req, res) => {
    res.json({
        success: true,
        methods: [
            {
                id: 'credit_card',
                name: 'Credit Card',
                description: 'Visa, MasterCard, American Express',
                icon: '💳'
            },
            {
                id: 'debit_card',
                name: 'Debit Card',
                description: 'Direct bank account payment',
                icon: '🏦'
            },
            {
                id: 'paypal',
                name: 'PayPal',
                description: 'Pay with your PayPal account',
                icon: '📧'
            },
            {
                id: 'crypto',
                name: 'Cryptocurrency',
                description: 'Bitcoin, Ethereum, and more',
                icon: '₿'
            }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
}); 