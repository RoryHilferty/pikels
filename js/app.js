window.onload = () => {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayIndex = new Date().getDay();

	document.querySelector('.today').innerHTML = days[dayIndex];

	function dayOfMonth() {
		const date = new Date().getDate().toString();
		const length = date.length;
		const lastChar = date[length - 1];
		let output;

		if ((length === 1 && lastChar === '1') || (length === 2 && lastChar === '1' && date[0] != '1')) {
			output = `${date}st`;
		} else if ((length === 1 && lastChar === '2') || (length === 2 && lastChar === '2' && date[0] != '1')) {
			output = `${date}nd`;
		} else if ((length === 1 && lastChar === '3') || (length === 2 && lastChar === '3' && date[0] != '1')) {
			output = `${date}rd`;
		} else {
			output = `${date}th`;
		}

		return output;
	}

	function getTimeAMPM() {
		const date = new Date();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12; // 0 is falsey and therefore becomes 12
		minutes = minutes < 10 ? `0${minutes}` : minutes;

		return `${hours}:${minutes} ${ampm}`;
	}

	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	const monthIndex = new Date().getMonth();

	document.querySelector('.date-and-time').innerHTML = `${dayOfMonth()} of ${months[monthIndex]}, ${getTimeAMPM()}`;

	let lat;
	let long;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((pos) => {
			lat = pos.coords.latitude;
			long = pos.coords.longitude;

			// proxy required on local host
			const proxy = 'https://cors-anywhere.herokuapp.com/';
			const api = `${proxy}https://api.darksky.net/forecast/6ca97efa591fc351111ac1291a345bfb/${lat},${long}?units=si&exlcude=minutely,alerts`;

			fetch(api)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data);

					const {
						icon,
						summary,
						temperature,
						apparentTemperature,
						humidity,
						precipProbability
					} = data.currently;

					const iconHTML = `<img src="images/${icon}.svg" alt="${summary}">`;

					document.querySelector('.current-weather-icon').innerHTML = iconHTML;
					document.querySelector('.current-temp').innerHTML = `
            ${temperature.toFixed(0)}&deg;
            <div class="feels-like">Feels like ${apparentTemperature.toFixed(0)}&deg;</div>
          `;

					document.querySelector('.humidity-data').innerHTML = `${(humidity * 100).toFixed(0)}%`;
					document.querySelector('.rain-data').innerHTML = `${(precipProbability * 100).toFixed(0)}%`;

					const hourly = data.hourly.data;
					const hourlySliderElem = document.querySelector('.hourly-slider');
					const buffer = '<div class="slider-buffer"></div>';

					hourlySliderElem.innerHTML = buffer;

					let i;
					for (i = 1; i < 25; i++) {
						let hourlyHour = new Date(hourly[i].time * 1000);
						let tempAndRain;
						const percip = (hourly[i].precipProbability * 100).toFixed(0);

						if (hourlyHour.getHours() < 10) {
							hourlyHour = `0${hourlyHour.getHours()}:00`;
						} else {
							hourlyHour = `${hourlyHour.getHours()}:00`;
						}

						if (percip > 4) {
							tempAndRain = `
					      ${hourly[i].temperature.toFixed(0)}&deg;<span class="rain">${percip}%</span>
					    `;
						} else {
							tempAndRain = `${hourly[i].temperature.toFixed(0)}&deg;`;
						}

						hourlySliderElem.innerHTML += `
					    <div class="hour">
					      <div class=" hour-time bold">${hourlyHour}</div>
					      <img src="images/${hourly[i].icon}.svg" alt="${hourly[i].summary}">
					      <div class="hour-temp bold">${tempAndRain}</div>
					    </div>
					  `;

						// console.log(hourlyHour, tempAndRain);
					}

					hourlySliderElem.innerHTML += buffer;

					const hourlySlider = new Flickity(hourlySliderElem, {
						freeScroll      : true,
						contain         : true,
						prevNextButtons : false,
						pageDots        : false
					});

					const daily = data.daily.data;
					const dailySliderElem = document.querySelector('.daily-slider');

					dailySliderElem.innerHTML = buffer;

					for (i = 1; i < 8; i++) {
						let dailyDay = i + dayIndex;

						if (dailyDay > 6) {
							dailyDay = days[dailyDay - 7];
						} else {
							dailyDay = days[dailyDay];
						}

						dailySliderElem.innerHTML += `
              <div class="day">
                <div class="day-of-week">${dailyDay.substring(0, 3)}</div>
                <img src="images/${daily[i].icon}.svg" alt="">
                <div class="day-temp">
                  ${daily[i].temperatureMax.toFixed(0)}&deg;
                  <span class="day-low-temp">${daily[i].temperatureLow.toFixed(0)}&deg;</span>
                </div>
              </div>
            `;

						console.log(i);
					}

					dailySliderElem.innerHTML += buffer;

					const dailySlider = new Flickity(dailySliderElem, {
						freeScroll      : true,
						contain         : true,
						prevNextButtons : false,
						pageDots        : false
					});
				});
		});
	}
};
