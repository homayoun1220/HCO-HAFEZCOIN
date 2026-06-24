import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function App() {
  const [status, setStatus] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalances, setWalletBalances] = useState(null);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ status: "error" }));

    fetch(`${API_URL}/token/info`)
      .then((res) => res.json())
      .then(setTokenInfo)
      .catch(() => setTokenInfo(null));
  }, []);

  const addMessage = (text) => setMessages((prev) => [text, ...prev].slice(0, 10));

  const loadWalletBalances = async () => {
    if (!walletAddress) return;
    const res = await fetch(`${API_URL}/wallet/${walletAddress}/balance`);
    const data = await res.json();
    setWalletBalances(data);
  };

  const transferTokens = async () => {
    const res = await fetch(`${API_URL}/token/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: transferTo, amount: transferAmount, privateKey }),
    });
    const data = await res.json();
    addMessage(`Transfer tx: ${data.receipt?.transactionHash ?? "failed"}`);
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Hafez Token Dashboard</h1>
        <p>Connection: {status?.status ?? "loading..."}</p>
        <p>Chain ID: {status?.chainId ?? "--"}</p>
      </header>

      <section className="panel">
        <h2>Token info</h2>
        <pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
      </section>

      <section className="panel">
        <h2>Wallet balance</h2>
        <label>
          Address
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </label>
        <button onClick={loadWalletBalances}>Load Balances</button>
        <pre>{JSON.stringify(walletBalances, null, 2)}</pre>
      </section>

      <section className="panel">
        <h2>Transfer Hafez</h2>
        <label>
          Recipient
          <input
            type="text"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
        </label>
        <label>
          Amount
          <input
            type="text"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
        </label>
        <label>
          Private key
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
          />
        </label>
        <button onClick={transferTokens}>Send Tokens</button>
      </section>

      <section className="panel">
        <h2>Activity log</h2>
        <ul>
          {messages.map((m, index) => (
            <li key={index}>{m}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
