window.onload = () => {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayIndex = new Date().getDay();

	document.querySelector('.today').innerHTML = days[dayIndex];

	function dayOfMonth(date) {
		date = date.getDate().toString();
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

	function getThisMonth(date) {
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

		return months[date.getMonth()];
	}

	document.querySelector('.date-and-time').innerHTML = `
    ${dayOfMonth(new Date())} of ${getThisMonth(new Date())}, ${getTimeAMPM()}
  `;

	let lat;
	let long;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((pos) => {
			lat = pos.coords.latitude;
			long = pos.coords.longitude;

			// proxy required on local host
			const proxy = 'https://cors-anywhere.herokuapp.com/';
			const key = 'c1ba443dddbcbbb4e8515f74b9616d5b-ree';
			const api = `${proxy}https://api.darksky.net/forecast/${key}/${lat},${long}?units=si&exlcude=minutely,alerts`;

			fetch(api)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data);
					document.querySelector('.pre-loader').classList.add('hidden');

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
					for (i = 0; i < 25; i++) {
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

						hourlyHour = i ? hourlyHour : 'Now';

						hourlySliderElem.innerHTML += `
					    <div class="hour">
					      <div class=" hour-time bold">${hourlyHour}</div>
					      <img src="images/${hourly[i].icon}.svg" alt="${hourly[i].summary}">
					      <div class="hour-temp bold">${tempAndRain}</div>
					    </div>
					  `;
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

					for (i = 0; i < 8; i++) {
						let dailyDay = i ? i + dayIndex : 'Today';
						let dayOfWeek;

						if (dailyDay > 6) {
							dailyDay = days[dailyDay - 7];
							dayOfWeek = dailyDay;
						} else if (dailyDay > 0) {
							dailyDay = days[dailyDay];
							dayOfWeek = dailyDay;
						} else {
							dayOfWeek = days[dayIndex];
						}

						const dailyDayShort = dailyDay === 'Today' ? 'Today' : dailyDay.substring(0, 3);

						dailySliderElem.innerHTML += `
              <div class="day" data-day="${dayOfWeek}" data-index="${i}">
                <div class="day-of-week">${dailyDayShort}</div>
                <img src="images/${daily[i].icon}.svg" alt="">
                <div class="day-temp">
                  ${daily[i].temperatureMax.toFixed(0)}&deg;
                  <span class="day-low-temp">${daily[i].temperatureLow.toFixed(0)}&deg;</span>
                </div>
              </div>
            `;
					}

					dailySliderElem.innerHTML += buffer;

					const dailySlider = new Flickity(dailySliderElem, {
						freeScroll      : true,
						contain         : true,
						prevNextButtons : false,
						pageDots        : false
					});

					const forecastDays = document.querySelectorAll('.day');

					for (elem of forecastDays) {
						elem.addEventListener('click', (e) => {
							const elemIndex = e.target.dataset.index;
							const elemDate = new Date(daily[elemIndex].time * 1000);

							document.querySelector('.modal-content').innerHTML = `
                <div class="modal-day">${e.target.dataset.day}</div>
                <div class="modal-date">
                  ${dayOfMonth(elemDate)} of ${getThisMonth(elemDate)}
                </div>
      
                <div class="modal-icon">
                  <img src="images/${daily[elemIndex].icon}.svg" alt="">
                </div>
      
                <div class="modal-data-wrapper">
                  <img src="images/humidity.svg" alt="Humidity">
                  <div class="modal-data">
                      <div class="bold">${(daily[elemIndex].humidity * 100).toFixed(0)}%</div>
                      <div class="subtext">Humidity</div>
                  </div>
                </div>
                
                <div class="modal-data-wrapper">
                  <img src="images/chance_of_rain.svg" alt="Chance of rain">
                  <div class="modal-data">
                    <div class="bold">${(daily[elemIndex].precipProbability * 100).toFixed(0)}%</div>
                    <div class="subtext">Chance of rain</div>
                  </div>
                </div>
              `;

							document.querySelector('.modal-container').classList.remove('hidden');
						});
					}
				})
				.catch(() => {
					document.querySelector('.modal-container').classList.remove('hidden');
					document.querySelector('.modal-content').innerHTML = `
            <div class="modal-icon">
              <img src="images/penguin.svg" alt="" class="modal-error-img">
            </div>
            <div class="error-title">Oops!</div>
            <div class="error-text">Something's gone wrong - please try again later or look outside for current weather info.</div>
          `;
				});

			document.querySelector('.cross').addEventListener('click', () => {
				document.querySelector('.modal-container').classList.add('hidden');
			});
		});
	}
};
