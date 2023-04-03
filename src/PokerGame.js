import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  buyIn: yup.number().required("Buy-in is required"),
  cashOut: yup.number().required("Cash-out is required")
});

function calculateTransactions(netGains) {
  let sortedNetGains = Object.entries(netGains)
    .filter(([_, net]) => net !== 0)
    .sort((a, b) => a[1] - b[1]);
  let transactions = [];

  for (let i = 0, j = sortedNetGains.length - 1; i < j; ) {
    let from = sortedNetGains[i][0];
    let to = sortedNetGains[j][0];
    let amount = Math.min(-sortedNetGains[i][1], sortedNetGains[j][1]);
    sortedNetGains[i][1] += amount;
    sortedNetGains[j][1] -= amount;

    transactions.push({
      from,
      to,
      amount
    });

    if (sortedNetGains[i][1] === 0) {
      i++;
    }
    if (sortedNetGains[j][1] === 0) {
      j--;
    }
  }

  return transactions;
}

const PokerGame = () => {
  const [players, setPlayers] = React.useState([]);
  const [transactions, setTransactions] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      buyIn: "",
      cashOut: ""
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const newPlayer = {
        name: values.name,
        buyIn: parseFloat(values.buyIn),
        cashOut: parseFloat(values.cashOut),
        netGain: parseFloat(values.cashOut) - parseFloat(values.buyIn)
      };
      setPlayers([...players, newPlayer]);
      resetForm();
    }
  });

  const calculateResults = () => {
    const netGains = players.reduce((acc, player) => {
      acc[player.name] = player.netGain;
      return acc;
    }, {});
    setTransactions(calculateTransactions(netGains));
  };

  return (
    <div>
      <h1>Poker Game</h1>
      <form onSubmit={formik.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
        </label>
        {formik.errors.name && <div>{formik.errors.name}</div>}
        <br />
        <label>
          Buy-in:
          <input
            type="number"
            name="buyIn"
            value={formik.values.buyIn}
            onChange={formik.handleChange}
          />
        </label>
        {formik.errors.buyIn && <div>{formik.errors.buyIn}</div>}
        <br />
        <label>
          Cash-out:
          <input
            type="number"
            name="cashOut"
            value={formik.values.cashOut}
            onChange={formik.handleChange}
          />
        </label>
        {formik.errors.cashOut && <div>{formik.errors.cashOut}</div>}
        <br />
        <button type="submit">Add Player</button>
      </form>

      <div>
        <h2>Players</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index}>
              {player.name}: Buy-in: ${player.buyIn.toFixed(2)}, Cash-out: $
              {player.cashOut.toFixed(2)}, Net gain: $
              {player.netGain.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={calculateResults}>Calculate Results</button>

      {transactions && (
        <div>
          <h2>Transactions</h2>
          <ul>
            {transactions.length === 0 ? (
              <li>No transactions required.</li>
            ) : (
              transactions.map((transaction, index) => (
                <li key={index}>
                  {transaction.from} owes {transaction.to} $
                  {transaction.amount.toFixed(2)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PokerGame;
