import axios from "axios";
import React, { useEffect, useState } from "react";
import { xml2js, xml2json } from "xml-js";

function CurrencySelect({ data }) {
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [checked, setChecked] = useState();
  const [number, setNumber] = useState();
  const [buying, setBuying] = useState();
  const [selling, setSelling] = useState();

  // "Kod" değerlerini çıkaran fonksiyon
  const extractCurrencyCodes = (data) => {
    if (!data || !data.Tarih_Date || !data.Tarih_Date.Currency) {
      return []; // Veri eksikse boş bir array döner
    }
    const currencies = data.Tarih_Date.Currency;
    return currencies.map((currency) => currency._attributes.Kod);
  };

  // Seçilen kodu güncelleyen ve ilgili para birimini bulan fonksiyon
  const handleSelectChange = (event) => {
    const selected = event.target.value;
    setSelectedCode(selected);
    setChecked("");
    setNumber("");
    setBuying("");
    setSelling("");
    if (data && data.Tarih_Date && data.Tarih_Date.Currency) {
      const currency = data.Tarih_Date.Currency.find(
        (currency) => currency._attributes.Kod === selected
      );
      setSelectedCurrency(currency || null); // Para birimi bulunamazsa null döner
    } else {
      setSelectedCurrency(null);
    }
  };

  // Kod değerlerini alalım
  const currencyCodes = extractCurrencyCodes(data);
  const handleCheckChange = (event) => {
    setChecked(event.target.value);
    setBuying(selectedCurrency.BanknoteBuying?._text * number);
    setSelling(selectedCurrency.BanknoteSelling?._text * number);
  };
  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };
  return (
    <div>
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mx-10 my-5 w-100"
        value={selectedCode}
        onChange={handleSelectChange}
      >
        <option value="">Bir para birimi seçin</option>
        {currencyCodes.map((code, index) => (
          <option key={index} value={code}>
            {code}
          </option>
        ))}
      </select>

      {selectedCurrency ? (
        <div className="mx-10">
          <h3 className="">
            <span className="italic">Seçilen Para Birimi:</span> {selectedCode}
          </h3>
          <input
            type="number"
            className="w-1/4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={handleNumberChange}
            value={number}
          />
          <div className="flex flex-row gap-5 my-4">
            <input
              type="radio"
              value="BanknoteBuying"
              name="gender"
              checked={checked === "BanknoteBuying"}
              onChange={handleCheckChange}
            />{" "}
            Alış
            <input
              type="radio"
              value="BanknoteSelling"
              name="gender"
              checked={checked === "BanknoteSelling"}
              onChange={handleCheckChange}
            />{" "}
            Satış
          </div>

          {checked === "BanknoteBuying" ? (
            <p>{buying && buying + " ₺"}</p>
          ) : (
            <p>{selling && selling + " ₺"} </p>
          )}
        </div>
      ) : selectedCode ? (
        <p>Bu para birimi için veri bulunamadı.</p>
      ) : null}
    </div>
  );
}

// Bileşeni render etmek
function App() {
  const [jsonData, setJsonData] = useState(null);
  useEffect(() => {
    // XML dosyasını yükle
    axios
      .get(
        "https://cors-anywhere.herokuapp.com/https://www.tcmb.gov.tr/kurlar/today.xml",
        // "https://www.tcmb.gov.tr/kurlar/today.xml",
        {
          "Content-Type": "application/xml; charset=utf-8"
        }
      )
      .then((response) => {
        const xml = response.data;
        // console.log(xml);

        // XML'i JSON'a dönüştür
        const result = JSON.parse(xml2json(xml, { compact: true, spaces: 2 }));
        setJsonData(result);
      })
      .catch((error) => {
        console.error("Error fetching the XML file: ", error);
      });
  }, []);
  return (
    <div className="App">
      <CurrencySelect data={jsonData} />
    </div>
  );
}

export default App;
