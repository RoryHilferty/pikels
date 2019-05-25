window.onload = () => {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayIndex = new Date().getDay();

	document.querySelector('.day').innerHTML = days[dayIndex];

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
		hours = hours ? hours : 12; // the hour '0' should be '12'
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
};
