<template>
  <div class="simple-weather">
    <div class="temperature">{{ Math.round(weatherData.main.temp) }}°C</div>

    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-label">天气状况：</span>
        <span class="detail-value">{{ getChineseWeather(weatherData.weather[0].main) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">相对湿度：</span>
        <span class="detail-value">{{ weatherData.main.humidity }}%</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">风速：</span>
        <span class="detail-value">{{ weatherData.wind.speed }} 米/秒</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "WeatherWidget",
  data() {
    return {
      loading: true,
      error: null,
      weatherData: {
        name: "Beijing",
        main: {
          temp: 30,
          humidity: 67,
        },
        weather: [
          {
            description: "broken clouds",
            icon: "04d",
          },
        ],
        wind: {
          speed: 2.04,
        },
      },
      apiKey: "d204549d1bb5bd41200b48fc23eac2db",
      city: "BeiJing",
    };
  },
  computed: {
    weatherIcon() {
      const iconCode = this.weatherData.weather[0].icon;
      return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    },
  },
  created() {
    this.fetchWeather();
  },
  methods: {
    async fetchWeather() {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${this.apiKey}`
        );
        this.weatherData = response.data;
      } catch (err) {
        console.error("获取天气数据失败:", err);
      }
    },
    getChineseWeather(weather) {
      const weatherMap = {
        Clear: "晴",
        Clouds: "多云",
        Rain: "雨",
        Snow: "雪",
        Thunderstorm: "雷雨",
        Drizzle: "细雨",
        Mist: "薄雾",
        Smoke: "烟雾",
        Haze: "雾霾",
        Dust: "浮尘",
        Fog: "雾",
        Sand: "沙尘",
        Ash: "火山灰",
        Squall: "狂风",
        Tornado: "龙卷风",
      };
      return weatherMap[weather] || weather;
    },
    refreshWeather() {
      this.fetchWeather();
    },
    mounted() {
      // 设置每分钟自动刷新
      this.refreshInterval = setInterval(() => {
        this.fetchWeather();
      }, 60000); // 60,000毫秒 = 1分钟

      // 初始加载
      this.fetchWeather();
    },
    beforeDestroy() {
      // 组件销毁时清除定时器
      clearInterval(this.refreshInterval);
    },
  },
};
</script>

<style scoped>
.minimal-weather {
  font-family: "Microsoft YaHei", sans-serif;
  max-width: 220px;
  margin: 0 auto;
  padding: 15px;
  /* 去除背景色和阴影 */
  background: transparent;
}

.temperature {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
}

.weather-details {
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.detail-label {
  color: #666;
  margin-right: 5px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}
</style>
