"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useDebounce } from "use-debounce";
import { registerables } from "chart.js";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { db, auth } from "../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

Chart.register(...registerables, zoomPlugin);

const StockChart = () => {
  const [isClient, setIsClient] = useState(false);
  const [ticker, setTicker] = useState<string>("");
  const [suggestions, setSuggestions] = useState<
    { symbol: string; name: string }[]
  >([]);
  const [debouncedTicker] = useDebounce(ticker, 500);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });
  const [filter, setFilter] = useState<string>("3m");
  const [alertPrice, setAlertPrice] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true); // Set the state to true on the client side
  }, []);

  useEffect(() => {
    if (isClient) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserEmail(user.email);
        } else {
          setUserEmail(null);
        }
      });
      return () => unsubscribe();
    }
  }, [isClient]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Price",
        },
      },
      x: {
        type: "time",
        time: {
          unit: "month",
        },
        title: {
          display: true,
          text: "Date",
        },
      },
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
      },
    },
  };

  const fetchData = (ticker: string, fromDate: string, toDate: string) => {
    if (isClient) {
      axios
        .get(
          `https://www.wallstreetoddsapi.com/api/historicstockprices?&symbol=${ticker}&from=${fromDate}&to=${toDate}&fields=symbol,date,close&apikey=${process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY}&format=json`
        )
        .then((response) => {
          const prices = response.data.response;
          setChartData({
            labels: prices.map((price: { date: string }) => price.date),
            datasets: [
              {
                label: "Price",
                data: prices.map((price: { close: number }) => price.close),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.4,
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);

    if (isClient) {
      const today = new Date();
      let fromDate = new Date();

      switch (newFilter) {
        case "3m":
          fromDate.setMonth(today.getMonth() - 3);
          break;
        case "6m":
          fromDate.setMonth(today.getMonth() - 6);
          break;
        case "1yr":
          fromDate.setFullYear(today.getFullYear() - 1);
          break;
        case "5yr":
          fromDate.setFullYear(today.getFullYear() - 5);
          break;
        case "all":
          fromDate = new Date("2000-01-01");
          break;
        default:
          fromDate.setMonth(today.getMonth() - 3);
      }

      fetchData(
        debouncedTicker,
        fromDate.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );
    }
  };

  useEffect(() => {
    if (debouncedTicker && isClient) {
      axios
        .get(
          `https://www.wallstreetoddsapi.com/api/stockprofile?apikey=${process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY}&fields=symbol,companyName,exchange,industry,sector,website,country,city,address,ipoDate,beta&format=json&symbol=${debouncedTicker}`
        )
        .then((response) => {
          const company = response.data.response[0];
          setCompanyInfo({
            symbol: company.symbol,
            companyName: company.companyName,
            exchange: company.exchange,
            industry: company.industry,
            sector: company.sector,
            website: company.website,
            country: company.country,
            city: company.city,
            address: company.address,
            ipoDate: company.ipoDate,
            beta: company.beta,
          });

          const today = new Date().toISOString().split("T")[0];
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const fromDate = threeMonthsAgo.toISOString().split("T")[0];

          return axios.get(
            `https://www.wallstreetoddsapi.com/api/historicstockprices?&symbol=${debouncedTicker}&from=${fromDate}&to=${today}&fields=symbol,date,close&apikey=${process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY}&format=json`
          );
        })
        .then((response) => {
          const prices = response.data.response;
          setChartData({
            labels: prices.map((price: { date: string }) => price.date),
            datasets: [
              {
                label: "Price",
                data: prices.map((price: { close: number }) => price.close),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.4,
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [debouncedTicker, isClient]);

  const fetchSuggestions = (ticker: string) => {
    if (isClient) {
      axios
        .get(
          `https://www.wallstreetoddsapi.com/api/symbolsearch?apikey=${process.env.NEXT_PUBLIC_WALLSTREETODDS_API_KEY}&query=${ticker}&format=json`
        )
        .then((response) => {
          setSuggestions(
            response.data.response.map((suggestion: any) => ({
              symbol: suggestion.symbol,
              name: suggestion.name,
            }))
          );
        })
        .catch((error) => {
          console.error("Error fetching suggestions:", error);
        });
    }
  };

  useEffect(() => {
    if (ticker.length > 2) {
      fetchSuggestions(ticker);
    } else {
      setSuggestions([]);
    }
  }, [ticker]);

  const handleSuggestionClick = (suggestion: string) => {
    setTicker(suggestion);
    setSuggestions([]);
    handleFilterChange(filter);
  };

  const handleSubmit = async () => {
    if (userEmail && alertPrice && isClient) {
      console.log("Email:", userEmail);
      console.log("Alert Price:", alertPrice);
      console.log("Ticker:", ticker);

      try {
        await addDoc(collection(db, "priceAlerts"), {
          email: userEmail,
          alertPrice,
          ticker,
          createdAt: new Date().toISOString(),
        });
        alert(
          `Alert for price $${alertPrice} for stock ${ticker} was set successfully!`
        );
      } catch (error) {
        console.error("Error setting alert:", error);
        alert("Error setting alert.");
      }
    } else {
      alert("Please enter a valid email and price.");
    }
  };

  const currentPrice =
    chartData.datasets[0]?.data[chartData.datasets[0]?.data.length - 1];
  const formattedPrice =
    typeof currentPrice === "number" ? currentPrice.toFixed(2) : "N/A";

  if (!isClient) {
    return null; // Return null while rendering on the server
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Search for a stock..."
          className="border p-2 w-full"
        />
        {suggestions.length > 0 && (
          <ul className="border p-2 mt-2 w-full">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.symbol}
                onClick={() => handleSuggestionClick(suggestion.symbol)}
                className="cursor-pointer p-2"
              >
                <div>{suggestion.symbol}</div>
                <div className="text-sm">{suggestion.name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {companyInfo && (
        <div className="border p-4 mb-4">
          <h2 className="text-xl font-bold">{companyInfo.companyName}</h2>
          <div>Symbol: {companyInfo.symbol}</div>
          <div>Exchange: {companyInfo.exchange}</div>
          <div>Industry: {companyInfo.industry}</div>
          <div>Sector: {companyInfo.sector}</div>
          <div>
            Website:{" "}
            <a
              href={companyInfo.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {companyInfo.website}
            </a>
          </div>
          <div>Country: {companyInfo.country}</div>
          <div>City: {companyInfo.city}</div>
          <div>Address: {companyInfo.address}</div>
          <div>IPO Date: {companyInfo.ipoDate}</div>
          <div>Beta: {companyInfo.beta}</div>
        </div>
      )}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => handleFilterChange("3m")}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          3m
        </button>
        <button
          onClick={() => handleFilterChange("6m")}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          6m
        </button>
        <button
          onClick={() => handleFilterChange("1yr")}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          1yr
        </button>
        <button
          onClick={() => handleFilterChange("5yr")}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          5yr
        </button>
        <button
          onClick={() => handleFilterChange("all")}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          All
        </button>
      </div>
      <div className="relative h-96 mb-4">
        {chartData.labels && chartData.labels.length > 0 && (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
      <div className="text-2xl font-bold mt-4">
        Current Price: ${formattedPrice}
      </div>
      <div className="mb-4">
        <label>
          Select Price:
          <input
            type="number"
            value={alertPrice || ""}
            onChange={(e) => setAlertPrice(Number(e.target.value))}
            className="border p-2 ml-2"
          />
        </label>
      </div>
      <button onClick={handleSubmit} className="bg-green-500 text-white p-2">
        Set Alert
      </button>
    </div>
  );
};

export default StockChart;
