const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.checkStockPrices = functions.pubsub.schedule("every 1 hours").onRun(
    async (context) => {
      const alertsSnapshot = await db.collection("priceAlerts").get();
      const alerts = alertsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const alert of alerts) {
        const {ticker, alertPrice, email} = alert;
        try {
          const response = await axios.get(
              `https://www.wallstreetoddsapi.com/api/historicstockprices?&symbol=${ticker}&from=2000-01-01&to=${
                new Date().toISOString().split("T")[0]
              }&fields=symbol,date,close&apikey=${
                process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY
              }&format=json`,
          );
          const prices = response.data.response;
          const currentPrice = prices[prices.length - 1].close;

          if (currentPrice >= alertPrice || currentPrice <= alertPrice) {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Stock Price Alert",
              // eslint-disable-next-line max-len
              text: "The stock price of " + ticker + " has reached " + currentPrice + ", which is " +
              // eslint-disable-next-line max-len
              (currentPrice >= alertPrice ? "above" : "below") + " your alert threshold of " + alertPrice + ".",
            });
            await db.collection("priceAlerts").doc(alert.id).delete();
          }
        } catch (error) {
          console.error("Error checking stock price or sending email:", error);
        }
      }
    },
);
