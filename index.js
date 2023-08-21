'use strict';

import {
	a,
	button,
	ClassList,
	div,
	doomHelperDebug,
	footer,
	h1,
	h2,
	h3,
	img,
	input,
	li,
	mountableStylesheet,
	nav,
	QueryRouter,
	RouterLazyLoad,
	ShowIf,
	Signal,
	span,
	svg,
	text,
	TextState,
	ul
} from './res/domHelper_v001.min.js';

import {metaSet, metaType} from './res/metaTag.js';
import {fetchApi, mobileWidth} from './res/lib.js';

window.askForLoginAlert = () => window.messageAlert.addInfo('Login to use this page', 'Click login button at top right corner to login in', 3000);
window.loadingElement = svg('<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke-linecap="square"/>', '0 0 50 50', 'loaderCircle');
window.navMenu = new ClassList('links');
window.pageLoading = new Signal(false);

/**
 * @typedef {Object} LoginData
 * @property {boolean} login
 * @property {string} name
 * @property {string} studentID
 * @property {int} year
 * @property {int} semester
 */
// Main function
(function main() {
	console.log('index.js Init');
	window.messageAlert = new MessageAlert();
	window.requestState = requestStateObject();
	const font = mountableStylesheet('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');

	// debug
	let debugWindow = null;
	if (location.hostname === 'localhost') {
		console.log('Debug enabled');
		doomHelperDebug();

		// Memory usage (for chrome)
		if (window.performance && window.performance.memory) {
			const memoryUpdate = new Signal(window.performance.memory);
			setInterval(() => memoryUpdate.set(window.performance.memory), 1000);
			debugWindow = span(
				TextState(memoryUpdate, state => (state.usedJSHeapSize / 1000 / 1000).toFixed(2) + 'MB'),
				null,
				{style: 'position: absolute; top: 0; z-index: 100; background: black; font-size: 10px; opacity: 0.5;'});
		}
	} else
		console.log('Debug disable');

	// main code
	const pageIdName = {
		// search: 'Search',
		// schedule: 'Schedule',
		// grades: 'Grades',
		Home: '成功大學課程資訊及選課系統',
		CourseSearch: '課程查詢',
		Schedule: '課表',
		GradeInquiry: '成績查詢',
		CourseSelectionPreference: '志願排序',
	};
	const defaultPage = 'Home';
	const userLoginData = new Signal();
	const showLoginWindow = new Signal(false);
	const queryRouter = new QueryRouter('NCKU++', pageIdName, defaultPage,
		{
			Home: new RouterLazyLoad('./pages/home.js'),
			CourseSearch: new RouterLazyLoad('./pages/courseSearch.js', userLoginData),
			Schedule: new RouterLazyLoad('./pages/courseSchedule.js', userLoginData),
			GradeInquiry: new RouterLazyLoad('./pages/stuIdSysGrades.js', userLoginData),
			CourseSelectionPreference: new RouterLazyLoad('./pages/preferenceAdjust.js', userLoginData),
		},
		footer(
			div('borderLine'),
			div('source',
				h2('資料來源'),
				a(null, 'https://course.ncku.edu.tw/', 'noSelect', null, {target: '_blank'},
					img('res/assets/courseNcku_logo.png', '國立成功大學課程資訊及選課系統', 'noDrag')
				),
				a(null, 'https://nckuhub.com/', 'noSelect', null, {target: '_blank'},
					img('res/assets/nckuHub_logo.svg', 'NCKUHub', 'noDrag')
				),
				a(null, 'https://urschool.org/', 'noSelect', null, {target: '_blank'},
					img('res/assets/UrSchool_logo.png', 'UrSchool', 'noDrag')
				),
			),
			div('splitLine'),
			h3('By WavJaby'),
			h3('Email: WavJaby@gmail.com'),
			a(null, 'https://github.com/WavJaby/NCKUpp', 'openRepo noSelect', null, {target: '_blank'},
				img('./res/assets/github_icon.svg', 'GitHub icon', 'githubIcon noDrag'),
				span('GitHub repo'),
			),
		)
	);

	const pageButtons = {};
	for (const pageId in pageIdName) {
		if (pageId === 'Home')
			continue;
		pageButtons[pageId] = li(null, a(pageIdName[pageId], './?page=' + pageId, null, pageButtonClick, {pageId: pageId}));
	}
	queryRouter.onPageOpen = function (lastPageId, pageId) {
		const lastPageButton = pageButtons[lastPageId];
		if (lastPageId && lastPageButton)
			lastPageButton.classList.remove('opened');
		const nextPageButton = pageButtons[pageId];
		if (nextPageButton)
			nextPageButton.classList.add('opened');
		metaSet(metaType.TITLE, document.title);
	}

	// check login
	fetchApi('/login?mode=course', 'Check login').then(onLoginStateChange);

	const root = div('root',
		// Navbar
		nav('navbar noSelect',
			NavSelectList('loginBtn',
				span(TextState(userLoginData, /**@param{LoginData}state*/state =>
					state && state.login ? state.studentID : 'Login'
				)),
				[
					['Profile', null],
					['Logout', () => fetchApi('/logout').then(onLoginStateChange)],
				],
				false,
				() => {
					// Is login
					if (userLoginData.state && userLoginData.state.login)
						return true; // Open select list
					// Not login, open login window
					showLoginWindow.set(!showLoginWindow.state);
					return false; // Not open select list
				}
			),
			ul('hamburgerMenu', li(null,
				img('./res/assets/burger_menu_icon.svg', 'mobile menu button', 'noDrag noSelect', {onclick: () => window.navMenu.toggle('open')})
			)),
			ul('homePage', li(null, a('NCKU++', './?page=Home', null, pageButtonClick, {pageId: 'Home'}))),
			ul(window.navMenu,
				Object.values(pageButtons),
				// NavSelectList('arrow', text('List'), [
				//     ['0w0', null],
				//     ['awa', null],
				// ]),
			)
		),
		// Pages
		queryRouter.element,
		ShowIf(showLoginWindow, LoginWindow(onLoginStateChange)),
		ShowIf(window.pageLoading, div('loading', window.loadingElement.cloneNode(true))),
		window.messageAlert.element,
		requestState,
		debugWindow,
	);

	window.onload = () => {
		console.log('Window onload');
		font.mount();
		document.body.innerHTML = '';
		document.body.appendChild(root);
	};
	queryRouter.init();

	// functions
	function pageButtonClick(e) {
		e.preventDefault();
		const pageId = this['pageId'];
		queryRouter.openPage(pageId);
		return false;
	}

	function onLoginStateChange(response) {
		if (!response) {
			window.messageAlert.addError('Network error', 'Try again later', 3000);
			return;
		}
		/**@type LoginData*/
		const loginData = response.data;
		if (!loginData) {
			window.messageAlert.addError('Unknown login error', 'Try again later', 3000);
			return;
		}
		// Check if login error
		if (!loginData.login && response.msg) {
			window.messageAlert.addError('Login failed', response.msg, 5000);
			return;
		}

		// Success, set login data
		userLoginData.set(loginData);
		showLoginWindow.set(false);
	}

	/**
	 * @param {string} classname
	 * @param {Text|Element|Element[]} title
	 * @param {[string, function()][]} items
	 * @param {boolean} [enableHover]
	 * @param {function(): boolean} [onOpen]
	 * @return {HTMLUListElement}
	 */
	function NavSelectList(classname, title, items, enableHover, onOpen) {
		const itemsElement = ul(null);
		const list = ul(
			classname ? 'list ' + classname : 'list',
			enableHover ? {onmouseleave: closeSelectList, onmouseenter: openSelectList} : null,
			// Element
			li('items', itemsElement),
			li('title', title, {onclick: toggleSelectList}),
		);

		for (const item of items) {
			const itemOnclick = item[1];
			itemsElement.appendChild(
				li(null, text(item[0]), {
					onclick: itemOnclick ? () => {
						itemOnclick();
						closeSelectList();
					} : closeSelectList
				})
			);
		}

		function openSelectList() {
			if (window.innerWidth > mobileWidth)
				list.style.height = (list.firstElementChild.offsetHeight + list.lastElementChild.offsetHeight) + 'px';
		}

		function closeSelectList() {
			list.style.height = null;
		}

		function toggleSelectList() {
			if (onOpen && !onOpen() && !list.style.height) return;

			if (list.style.height)
				list.style.height = null;
			else
				list.style.height = (list.firstElementChild.offsetHeight + list.lastElementChild.offsetHeight) + 'px';
		}

		return list;
	}

	/**
	 * @constructor
	 */
	function MessageAlert() {
		const messageBoxRoot = div('messageBox');

		this.addInfo = function (title, description, removeTimeout) {
			createMessageBox('info', title, description, removeTimeout);
		}

		this.addError = function (title, description, removeTimeout) {
			createMessageBox('error', title, description, removeTimeout);
		}

		this.addSuccess = function (title, description, removeTimeout) {
			createMessageBox('success', title, description, removeTimeout);
		}

		this.element = messageBoxRoot;

		function onCloseBtn() {
			removeMessageBox(this.parentElement);
		}

		function createMessageBox(classname, title, description, removeTimeout) {
			const messageBox = div(classname,
				span(title, 'title'),
				span(description, 'description'),
				div('closeButton', {onclick: onCloseBtn})
			);
			// height += messageBox.offsetHeight + 10;
			if (removeTimeout !== undefined)
				messageBox.removeTimeout = setTimeout(() => removeMessageBox(messageBox), removeTimeout);
			// if (!updateTop)
			//     updateTop = setTimeout(updateMessageBoxTop, 0);
			if (messageBoxRoot.childElementCount > 0)
				messageBoxRoot.insertBefore(messageBox, messageBoxRoot.firstElementChild);
			else
				messageBoxRoot.appendChild(messageBox);
			messageBox.style.marginTop = -messageBox.offsetHeight + 'px';

			setTimeout(() => messageBox.classList.add('animation'), 10);
		}

		function removeMessageBox(messageBox) {
			clearTimeout(messageBox.removeTimeout);
			messageBox.style.opacity = '0';
			messageBox.style.marginTop = (-messageBox.offsetHeight) + 'px';
			setTimeout(() => {
				messageBoxRoot.removeChild(messageBox);
			}, 500);
		}
	}

	function requestStateObject() {
		const stateBox = div('stateBox noSelect');

		stateBox.addState = function (title) {
			return stateBox.appendChild(div(null,
				window.loadingElement.cloneNode(true),
				h1(title, 'title')
			));
		};

		stateBox.removeState = function (stateElement) {
			stateBox.removeChild(stateElement);
		};

		return stateBox;
	}

	function LoginWindow(onLoginStateChange) {
		const username = input('loginField', 'Account', null, {onkeyup, type: 'text'});
		const password = input('loginField', 'Password', null, {onkeyup, type: 'password'});
		let loading = false;

		function onkeyup(e) {
			if (e.key === 'Enter') login();
		}

		function login() {
			if (!loading) {
				loading = true;
				window.pageLoading.set(true);
				const usr = username.value.endsWith('@ncku.edu.tw') ? username : username.value + '@ncku.edu.tw';
				fetchApi('/login?mode=course', 'login', {
					method: 'POST',
					body: `username=${encodeURIComponent(usr)}&password=${encodeURIComponent(password.value)}`,
					timeout: 10000,
				}).then(i => {
					loading = false;
					window.pageLoading.set(false);
					onLoginStateChange(i);
				});
			}
		}

		// element
		return div('loginWindow', {onRender: () => username.focus()},
			username,
			password,
			button('loginField', 'Login', login, {type: 'submit'}),
		);
	}
})();