import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";

// 90.000 doların altına düştüğünde bildirim göndermek
const btcPriceAlert = 68500;

export default function App() {
  const [btcPrice, setBtcPrice] = useState(null);

  // Bildirim izinlerini al
  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        console.log("Bildirim izni verildi.");
      }
    };

    getPermission();
  }, []);

  // BTC fiyatını al (fetch kullanarak)
  const fetchBTCPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const data = await response.json();
      const price = data.bitcoin.usd;
      setBtcPrice(price);

      // Fiyat 98.500'in üstündeyse bildirim gönder
      if (price > btcPriceAlert) {
        sendNotification(price);
      }
    } catch (error) {
      console.error("BTC fiyatı alınırken hata oluştu:", error);
    }
  };

  // Bildirim gönderme
  const sendNotification = async (price) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "BTC Fiyatı Düşüşte!",
        body: `Bitcoin fiyatı ${price} doların altına düştü!`,
      },
      trigger: null,
    });
  };

  useEffect(() => {
    const intervalId = setInterval(fetchBTCPrice, 15 * 60 * 1000);

    fetchBTCPrice();

    // Temizleme işlemi
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Bitcoin Fiyatı: ${btcPrice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
