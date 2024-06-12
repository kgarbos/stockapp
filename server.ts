import express from 'express';
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import { db } from './firebaseConfig'; // Import the db from your firebaseConfig.ts

dotenv.config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/set-alert', async (req, res) => {
  const { email, ticker, alertPrice } = req.body;

  try {
    await db.collection('priceAlerts').add({ email, ticker, alertPrice });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Stock Index Alert Set',
      text: `Your alert for ${ticker} has been set. You will be notified when the stock price crosses the threshold of ${alertPrice}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent: ' + info.response);
      res.send('Alert set and email sent');
    });
  } catch (error) {
    console.error('Error setting alert:', error);
    res.status(500).send('Error setting alert');
  }
});

const checkStockPrices = async () => {
  const alertsSnapshot = await db.collection('priceAlerts').get();
  const alerts = alertsSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data() as { ticker: string, alertPrice: number, email: string },
  }));

  for (const alert of alerts) {
    const { ticker, alertPrice, email } = alert;
    try {
      const response = await axios.get(
        `https://www.wallstreetoddsapi.com/api/historicstockprices?symbol=${ticker}&from=2000-01-01&to=${new Date().toISOString().split('T')[0]}&fields=symbol,date,close&apikey=${process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY}&format=json`
      );
      const prices = response.data.response;
      const currentPrice = prices[prices.length - 1].close;

      if (currentPrice >= alertPrice || currentPrice <= alertPrice) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Stock Price Alert',
          text: `The stock price of ${ticker} has reached ${currentPrice}, which is ${currentPrice >= alertPrice ? 'above' : 'below'} your alert threshold of ${alertPrice}.`,
        });
        await db.collection('priceAlerts').doc(alert.id).delete();
      }
    } catch (error) {
      console.error('Error checking stock price or sending email:', error);
    }
  }
};

setInterval(checkStockPrices, 3600000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
