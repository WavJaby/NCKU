'use strict';

/**
 * @typedef {Object} CourseDataRaw
 * @property {string} dn - departmentName
 * @property {string} sn - serialNumber
 * @property {string} ca - attributeCode
 * @property {string} cs - systemNumber
 * @property {string} cn - courseName
 * @property {string} ci - courseNote
 * @property {string} cl - courseLimit
 * @property {string} ct - courseType
 * @property {int} g - courseGrade 年級
 * @property {string} co - classInfo 班別
 * @property {string} cg - classGroup 組別
 * @property {string[]} i - instructors
 * @property {string[]} tg - tags
 * @property {float} c - credits
 * @property {boolean} r - required
 * @property {int} s - selected
 * @property {int} a - available
 * @property {string[]} t - time
 * @property {string} m - moodle
 * @property {string} o - outline
 * @property {string} pe - preferenceEnter
 * @property {string} ac - addCourse
 * @property {string} pr - preRegister
 * @property {string} ar - addRequest
 */
/**
 * @typedef CourseData
 * @property {string} departmentName
 * @property {string} serialNumber
 * @property {string} attributeCode
 * @property {string} systemNumber
 * @property {string} courseName
 * @property {string|null} courseNote
 * @property {string|null} courseLimit
 * @property {string} courseType
 * @property {int} courseGrade
 * @property {string} classInfo
 * @property {string} classGroup
 * @property {(UrSchoolInstructorSimple|string)[]|null} instructors - Only name or full data
 * @property {CourseDataTag[]|null} tags
 * @property {float} credits
 * @property {boolean} required
 * @property {int} selected
 * @property {int} available
 * @property {CourseDataTime[]|null} time
 * @property {string} timeString
 * @property {string} moodle
 * @property {string} outline
 * @property {string} preferenceEnter
 * @property {string} addCourse
 * @property {string} preRegister
 * @property {string} addRequest
 * @property {NckuHub|null} nckuhub
 */
/**
 * @typedef {Object} CourseDataTag
 * @property {string} name
 * @property {string} color
 * @property {string} [link]
 */
/**
 * @typedef {Object} CourseDataTime
 * @property {int} dayOfWeek
 * @property {int} sectionStart
 * @property {int} [sectionEnd]
 * @property {string} deptID
 * @property {string} classroomID
 * @property {string} classroomName
 * @property {string} [extraTimeDataKey]
 */
/**
 * @typedef {Object} UrSchoolInstructor
 * @property {string} id
 * @property {[path: string, name: string][]} tags
 * @property {int} reviewerCount
 * @property {int} takeCourseCount
 * @property {string[]} takeCourseUser
 * @property {UrSchoolInstructorComments[]} comments
 * @property {UrSchoolInstructorSimple} info,
 */
/**
 * @typedef {Object} UrSchoolInstructorComments
 * @property {string} updated_at
 * @property {int} user_id
 * @property {boolean} is_anonymous
 * @property {string} profile
 * @property {string} created_at
 * @property {int} id
 * @property {string} body
 * @property {int} status
 * @property {int} timestamp
 */
/**
 * @typedef {Object} UrSchoolInstructorSimple
 * @property {string} id
 * @property {string} mode
 * @property {string} name
 * @property {string} department
 * @property {string} jobTitle
 * @property {float} recommend
 * @property {float} reward
 * @property {float} articulate
 * @property {float} pressure
 * @property {float} sweet
 * @property {string} averageScore
 * @property {string} qualifications
 * @property {string} note
 * @property {string} nickname
 * @property {string} rollCallMethod
 */
/**
 * @typedef {Object} NckuHub
 * @property {boolean} noData
 * @property {int} rate_count
 * @property {string} got
 * @property {string} sweet
 * @property {string} cold
 * @property {NckuHubCommentObject[]} comments
 * @property {Object.<int, NckuHubRateObject>} parsedRates
 */
/**
 * @typedef {Object} NckuHubRaw
 * @property {string} got
 * @property {string} sweet
 * @property {string} cold
 * @property {int} rate_count
 * @property {NckuHubCommentObject[]} comment
 * @property {NckuHubRateObject[]} rates
 */
/**
 * @typedef {Object} NckuHubRateObject
 * @property {int} id
 * @property {int} user_id
 * @property {int} post_id
 * @property {float} got
 * @property {float} sweet
 * @property {float} cold
 * @property {int} like
 * @property {int} dislike
 * @property {int} hard
 * @property {int} recommend
 * @property {int} give
 * @property {string} course_name
 * @property {string} teacher
 */
/**
 * @typedef {Object} NckuHubCommentObject
 * @property {int} id
 * @property {string} comment
 * @property {string} semester
 */
/**
 * @typedef {Object} AllDeptData
 * @property {int} deptCount
 * @property {AllDeptGroup[]} deptGroup
 * @typedef {Object} AllDeptGroup
 * @property {string} name
 * @property {[string, string][]} dept
 */

/*ExcludeStart*/
const module = {};
const {
    div,
    input,
    button,
    span,
    Signal,
    State,
    ClassList,
    table,
    tr,
    th,
    td,
    p,
    img,
    thead,
    tbody,
    colgroup,
    col,
    text,
    a,
    linkStylesheet
} = require('../domHelper');
const SelectMenu = require('../selectMenu');
/*ExcludeEnd*/

// [default, success, info, primary, warning, danger]
const courseDataTagColor = [
    'gray',
    '#5cb85c',
    '#5bc0de',
    '#337ab7',
    '#f0ad4e',
    '#d9534f'
];

module.exports = function (loginState) {
    console.log('Course search Init');
    const styles = linkStylesheet('./res/pages/courseSearch.css');
    const expandArrowImage = img('./res/assets/down_arrow_icon.svg');

    const searchResultSignal = new Signal({loading: false, courseResult: null, nckuhubResult: null});
    const instructorInfoBubble = InstructorInfoBubble();
    const instructorDetailWindow = InstructorDetailWindow();
    const nckuhubDetailWindow = NckuhubDetailWindow();

    // Element
    const courseRenderResult = [];
    let courseSearch, courseSearchForm, courseSearchResultCount;
    // Static data
    let nckuHubCourseID = null;
    let urSchoolData = null;

    // query string
    let lastQueryString;
    let searching;

    async function onRender() {
        console.log('Course search Render');
        styles.mount();
        fetchApi('/alldept').then(i => {
            deptNameSelectMenu.setOptions(i.data.deptGroup.map(i => [i.name, i.dept]));
            loadLastSearch();
        });
    }

    function onPageOpen() {
        console.log('Course search Open');
        // close navLinks when using mobile devices
        window.navMenu.remove('open');
        styles.enable();
        loadLastSearch();
    }

    function onPageClose() {
        console.log('Course search Close');
        styles.disable();
    }

    function loadLastSearch() {
        const rawQuery = window.urlHashData.get('searchRawQuery');
        if (!rawQuery || rawQuery.length === 0)
            return;

        for (const rawQueryElement of rawQuery) {
            for (const node of courseSearchForm.children) {
                if (node instanceof HTMLInputElement) {
                    if (node.id === rawQueryElement[0])
                        node.value = rawQueryElement[1];
                }
                // Self define input
                else if (node instanceof HTMLDivElement && node.id !== undefined && node.value !== undefined) {
                    if (node.id === rawQueryElement[0])
                        node.setValue(rawQueryElement[1]);
                }
            }
        }
        search(rawQuery, false);
    }

    /**
     * @param {string[][]} [rawQuery] [key, value][]
     * @param {boolean} [saveQuery] Will save query string if not provide or true
     * @return {void}
     */
    async function search(rawQuery, saveQuery) {
        if (searching) return;
        searching = true;
        // get all course ID
        if (nckuHubCourseID === null)
            nckuHubCourseID = (await fetchApi('/nckuhub')).data;

        // get urSchool data
        if (urSchoolData === null)
            urSchoolData = (await fetchApi('/urschool')).data;

        let queryData = rawQuery instanceof Event ? null : rawQuery;
        if (!queryData) {
            // Generate query from form
            queryData = [];
            for (const node of courseSearchForm.children) {
                if (node instanceof HTMLInputElement ||
                    node instanceof HTMLDivElement && node.id !== undefined && node.value !== undefined) {
                    const value = node.value.trim();
                    if (value.length > 0)
                        queryData.push([node.id, value]);
                }
            }
        }
        // To query string
        const queryString = queryData.map(i => i[0] + '=' + encodeURIComponent(i[1])).join('&');

        // Save query string and create history
        if ((saveQuery === undefined || saveQuery === true) && lastQueryString !== queryString)
            window.urlHashData.set('searchRawQuery', queryData);

        // Update queryString
        lastQueryString = queryString;

        console.log('Search:', queryString);
        searchResultSignal.set({loading: true, courseResult: null, nckuhubResult: null});

        // fetch data
        const result = (await fetchApi('/search?' + queryString, {timeout: 5000}));

        if (!result || !result.success || !result.data) {
            searchResultSignal.set({loading: false, courseResult: null, nckuhubResult: null});
            searching = false;
            return;
        }

        // Parse result
        /**@type CourseData[]*/
        const courseResult = [];
        const nckuhubResult = {};
        if (!(result.data instanceof Array)) {
            const arr = [];
            Object.values(result.data).forEach(i => arr.push(...i));
            result.data = arr;
        }
        for (/**@type CourseDataRaw*/const data of result.data) {
            const courseData = /**@type CourseData*/ {
                departmentName: data.dn,
                serialNumber: data.sn,
                attributeCode: data.ca,
                systemNumber: data.cs,
                courseName: data.cn,
                courseNote: data.ci,
                courseLimit: data.cl,
                courseType: data.ct,
                courseGrade: data.g,
                classInfo: data.co,
                classGroup: data.cg,
                instructors: null,
                tags: null,
                credits: data.c,
                required: data.r,
                selected: data.s,
                available: data.a,
                time: null,
                timeString: null,
                moodle: data.m,
                outline: data.o,
                preferenceEnter: data.pe,
                addCourse: data.ac,
                preRegister: data.pr,
                addRequest: data.ar,
                nckuhub: null
            };
            courseResult.push(courseData);

            // Parse time
            if (data.t != null)
                courseData.time = data.t.map(i => {
                    if (i.indexOf(',') === -1)
                        return {extraTimeDataKey: i[0]};
                    i = i.split(',');
                    return {
                        dayOfWeek: parseInt(i[0]),
                        sectionStart: i[1].length === 0 ? null : i[1],
                        sectionEnd: i[2].length === 0 ? null : i[2],
                        deptID: i[3].length === 0 ? null : i[3],
                        classroomID: i[4].length === 0 ? null : i[4],
                        classroomName: i[5].length === 0 ? null : i[5]
                    };
                });
            courseData.timeString = courseData.time === null ? 'pending' : courseData.time.map(i => {
                if (i.extraTimeDataKey) return '';
                if (i.sectionStart !== null) {
                    let section;
                    if (i.sectionEnd !== null) {
                        section = i.sectionStart + '~' + i.sectionEnd;
                    } else
                        section = i.sectionStart;
                    return '[' + i.dayOfWeek + ']' + section;
                }
                return '[' + i.dayOfWeek + ']';
            }).join(', ');

            // Parse instructors
            if (data.i !== null)
                courseData.instructors = data.i.map(i => {
                    for (const j of urSchoolData) if (j[2] === i)
                        return {
                            id: j[0],
                            mode: j[1],
                            name: j[2],
                            department: j[3],
                            jobTitle: j[4],
                            recommend: parseFloat(j[5]),
                            reward: parseFloat(j[6]),
                            articulate: parseFloat(j[7]),
                            pressure: parseFloat(j[8]),
                            sweet: parseFloat(j[9]),
                            averageScore: j[10],
                            qualifications: j[11],
                            note: j[12],
                            nickname: j[13],
                            rollCallMethod: j[14]
                        };
                    return i;
                });

            // Parse tags
            if (data.tg !== null)
                courseData.tags = data.tg.map(i => {
                    i = i.split(',');
                    return {
                        name: i[0],
                        color: i[1].charCodeAt(0) === 0x23 ? i[1] : courseDataTagColor[i[1]],
                        link: i[2].length === 0 ? null : i[2],
                    }
                });


            // Nckuhub
            if (data.sn != null) {
                const deptAndID = data.sn.split('-');
                let nckuHubID = nckuHubCourseID[deptAndID[0]];
                if (nckuHubID) nckuHubID = nckuHubID[deptAndID[1]];
                if (nckuHubID) nckuhubResult[data.sn] = {nckuHubID, courseData, signal: new Signal()};
            }
        }

        // Get nckuhub data
        const chunkSize = 10;
        const nckuHubDataArr = Object.values(nckuhubResult);
        for (let i = 0; i < nckuHubDataArr.length; i += chunkSize) {
            const chunk = [];
            for (let j = i; j < i + chunkSize && j < nckuHubDataArr.length; j++)
                chunk.push(nckuHubDataArr[j].nckuHubID);
            fetchApi('/nckuhub?id=' + chunk.join(',')).then(response => {
                for (let j = 0; j < chunk.length; j++) {
                    const {/**@type CourseData*/courseData, /**@type Signal*/signal} = nckuHubDataArr[i + j];
                    /**@type NckuHubRaw*/
                    const nckuhub = response.data[j];
                    courseData.nckuhub = /**@type NckuHub*/ {
                        noData: nckuhub.rate_count === 0 && nckuhub.comment.length === 0,
                        got: parseFloat(nckuhub.got),
                        sweet: parseFloat(nckuhub.sweet),
                        cold: parseFloat(nckuhub.cold),
                        rate_count: nckuhub.rate_count,
                        comments: nckuhub.comment,
                        parsedRates: nckuhub.rates.reduce((a, v) => {
                            // nckuhub why
                            if (!v.recommend && v['recommand']) {
                                v.recommend = v['recommand'];
                                delete v['recommand'];
                            }
                            a[v.post_id] = v;
                            return a;
                        }, {})
                    };
                    signal.update();
                }
            });
        }

        console.log(courseResult);
        searchResultSignal.set({loading: false, courseResult, nckuhubResult});
        searching = false;
    }

    function openInstructorDetailWindow(info) {
        window.pageLoading.set(true);
        fetchApi(`/urschool?id=${info.id}&mode=${info.mode}`).then(response => {
            /**@type UrSchoolInstructor*/
            const instructor = response.data;
            instructor.info = info;
            instructorDetailWindow.set(instructor);
            window.pageLoading.set(false);
        });
    }

    // Watched list
    let watchList = null;

    /**
     * @this {{courseData: CourseData}}
     */
    function watchedCourseAddRemove() {
        if (!loginState.state || !watchList) return;

        const courseData = this.courseData;
        let serialIndex, result;
        if ((serialIndex = watchList.indexOf(courseData.serialNumber)) === -1) {
            console.log('add watch');
            result = fetchApi('/watchdog', {
                method: 'POST',
                body: `studentID=${loginState.state.studentID}&courseSerial=${courseData.serialNumber}`
            });
            this.textContent = 'remove watch';
            watchList.push(courseData.serialNumber);
        } else {
            console.log('remove watch');
            result = fetchApi('/watchdog', {
                method: 'POST',
                body: `studentID=${loginState.state.studentID}&removeCourseSerial=${courseData.serialNumber}`
            });
            this.textContent = 'add watch';
            watchList.splice(serialIndex, 1);
        }
        result.then(i => {
            console.log(i);
        });
    }

    function getWatchCourse() {
        if (!loginState.state) return;
        fetchApi(`/watchdog?studentID=${loginState.state.studentID}`).then(i => {
            const eql = encodeURIComponent('&');
            watchList = [];
            Object.entries(i.data).forEach(i => i[1].forEach(j => watchList.push(i[0] + '-' + j)));
            const serialQuery = Object.entries(i.data).map(i => i[0] + '=' + i[1].join(',')).join(eql);
            search([['serial', serialQuery]], false);
        })
    }

    /**
     * @this {{cosdata: string}}
     */
    function sendCosData() {
        fetchApi(`/courseFuncBtn?cosdata=${this.cosdata}`).then(i => {
            if (i.success)
                window.messageAlert.addSuccess('Message', i.msg, 5000);
        });
    }

    // Render result
    const courseRenderResultSort = [];
    const courseRenderResultFilter = [];
    const expandButtons = [];

    function renderSearchResult(state) {
        if (state.loading) {
            resetSortArrow();
            courseRenderResult.length = 0;
            return window.loadingElement.cloneNode(true);
        }
        if (!state.courseResult) return div();

        if (courseRenderResult.length === 0) {
            // Render result elements
            courseRenderResultSort.length = 0;
            courseRenderResultFilter.length = 0;
            expandButtons.length = 0;
            for (/**@type{CourseData}*/const data of state.courseResult) {
                const expandArrowStateClass = new ClassList('expandDownArrow', 'expand');
                const nckuhubResultData = state.nckuhubResult[data.serialNumber];
                const expandButton = expandArrowImage.cloneNode();
                expandButtons.push(toggleCourseInfo);

                // Course detail
                let expandableHeightReference, expandableElement;
                const courseDetail = td(null, null, {colSpan: 12},
                    expandableElement = div('expandable', expandableHeightReference = div('info',
                        div('splitLine'),
                        // Course tags
                        data.tags === null ? null : div('tags',
                            data.tags.map(i => i.link
                                ? a(i.name, i.link, null, null, {style: 'background-color:' + i.color, target: '_blank'})
                                : div(null, text(i.name), {style: 'background-color:' + i.color})
                            )
                        ),

                        // Note, limit
                        data.courseNote === null ? null : span(data.courseNote, 'note'),
                        data.courseLimit === null ? null : span(data.courseLimit, 'limit red'),

                        // Instructor
                        span('Instructor: ', 'instructor'),
                        data.instructors === null ? null : data.instructors.map(/**@param{UrSchoolInstructorSimple|string}instructor*/instructor =>
                            button('instructorBtn',
                                instructor instanceof Object ? instructor.name : instructor,
                                instructor instanceof Object ? () => openInstructorDetailWindow(instructor) : null,
                                instructor instanceof Object ? {
                                    onmouseenter: e => {
                                        instructorInfoBubble.set({
                                            target: e.target,
                                            offsetY: courseSearch.parentElement.scrollTop,
                                            data: instructor
                                        });
                                    },
                                    onmouseleave: instructorInfoBubble.hide
                                } : null
                            )
                        )
                    ))
                );

                // nckuhub info
                const nckuhubInfo = nckuhubResultData && nckuhubResultData.signal
                    ? State(nckuhubResultData.signal, () => {
                        if (data.nckuhub) {
                            if (data.nckuhub.noData) return td('No data', 'nckuhub', {colSpan: 3});
                            const options = {colSpan: 3, onclick: openNckuhubDetailWindow};
                            if (data.nckuhub.rate_count === 0)
                                return td('No rating', 'nckuhub', options);
                            return td(null, 'nckuhub', options,
                                span(data.nckuhub.got.toFixed(1), 'reward'),
                                span(data.nckuhub.sweet.toFixed(1), 'sweet'),
                                span(data.nckuhub.cold.toFixed(1), 'cool'),
                            );
                        }
                        return td('Loading...', 'nckuhub', {colSpan: 3});
                    })
                    : td('No data', 'nckuhub', {colSpan: 3})


                function toggleCourseInfo(forceState) {
                    if (forceState instanceof Boolean ? forceState : expandArrowStateClass.toggle('expand')) {
                        expandableElement.style.height = expandableHeightReference.offsetHeight + 'px';
                        setTimeout(() => expandableElement.style.height = null, 200);
                    } else {
                        expandableElement.style.height = expandableHeightReference.offsetHeight + 'px';
                        setTimeout(() => expandableElement.style.height = '0');
                    }
                }

                // Open nckuhub detail window
                function openNckuhubDetailWindow() {
                    if (!data.nckuhub) return;
                    nckuhubDetailWindow.set(data.nckuhub, true);
                }

                // render result item
                const courseResult = [
                    tr(),
                    // Info
                    tr(null,
                        // Title sections
                        td(null, expandArrowStateClass, expandButton, {onclick: toggleCourseInfo}),
                        td(data.departmentName, 'departmentName'),
                        td(data.serialNumber, 'serialNumber'),
                        td(data.courseType, 'courseType'),
                        td(data.classInfo, 'class'),
                        td(data.timeString, 'courseTime'),
                        td(data.courseName, 'courseName'),
                        td(data.credits, 'credits'),
                        td(data.selected === null && data.available === null ? null : `${data.selected}/${data.available}`, 'available'),
                        nckuhubInfo,
                        td(null, 'options', {rowSpan: 2},
                            !data.serialNumber || !loginState.state ? null :
                                button('addToWatch', watchList && watchList.indexOf(data.serialNumber) !== -1 ? 'remove watch' : 'add watch', watchedCourseAddRemove, {courseData: data}),
                            !data.preferenceEnter ? null :
                                button('addToWatch', '加入志願', sendCosData, {cosdata: data.preferenceEnter}),
                            !data.addCourse ? null :
                                button('addToWatch', '單科加選', sendCosData, {cosdata: data.addCourse}),
                        ),
                    ),
                    tr('courseDetail',
                        // Details
                        courseDetail,
                    )
                ];
                courseRenderResult.push([data, courseResult]);
                courseRenderResultFilter.push([data, courseResult]);
                courseRenderResultSort.push(courseResult);
            }
        }
        courseSearchResultCount.textContent = courseRenderResultSort.length;
        return tbody(null, courseRenderResultSort);
    }


    // Sort
    const sortArrow = expandArrowImage.cloneNode();
    const sortArrowClass = new ClassList('sortArrow');
    sortArrowClass.init(sortArrow);
    let sortKey = null;
    let sortLastIndex = null;

    function resetSortArrow() {
        sortKey = null;
        if (sortArrow.parentElement)
            sortArrow.parentElement.removeChild(sortArrow);
        sortArrowClass.remove('reverse');
    }

    function sortResultItem(key, element, method) {
        /**@type{[CourseData, HTMLElement][]}*/
        const courseResult = courseRenderResultFilter;
        courseRenderResultSort.length = courseResult.length;
        let reverse;
        if (sortKey !== key) {
            sortKey = key;
            courseResult.sort(method);
            sortLastIndex = courseResult.length;
            for (let i = courseResult.length - 1; i > -1; i--)
                if (!sortToEnd(courseResult[i][0][key])) {
                    sortLastIndex = i + 1;
                    break;
                }
            sortArrowClass.remove('reverse');
            reverse = false;
            element.appendChild(sortArrow);
        } else
            reverse = sortArrowClass.toggle('reverse');

        let i = 0;
        if (reverse)
            for (; i < sortLastIndex; i++)
                courseRenderResultSort[i] = courseResult[courseResult.length - i - 1][1];
        for (; i < courseResult.length; i++)
            courseRenderResultSort[i] = courseResult[i][1];

        searchResultSignal.update();
    }

    function sortStringKey() {
        if (courseRenderResult.length > 0) {
            const key = this.key;
            sortResultItem(key, this, ([a], [b]) => sortToEnd(a[key]) ? 1 : sortToEnd(b[key]) ? -1 : a[key].localeCompare(b[key]));
        }
    }

    function sortIntKey() {
        if (courseRenderResult.length > 0) {
            const key = this.key;
            sortResultItem(key, this, ([a], [b]) => (sortToEnd(a[key]) ? 1 : sortToEnd(b[key]) ? -1 : b[key] - a[key]));
        }
    }

    function sortNckuhubKey() {
        if (courseRenderResult.length > 0) {
            const key = this.key;
            const keys = ['sweet', 'cold', 'got'];
            keys.splice(keys.indexOf(key), 1);

            sortResultItem(key, this, (a, b) =>
                sortToEnd(a && (a = a[0]) && (a = a.nckuhub) && a[key]) ? 1 : sortToEnd(b && (b = b[0]) && (b = b.nckuhub) && b[key]) ? -1 : (
                    Math.abs(b[key] - a[key]) < 1e-10 ? (
                        sortToEnd(a[keys[0]]) ? 1 : sortToEnd(b[keys[0]]) ? -1 : (
                            Math.abs(b[keys[0]] - a[keys[0]]) < 1e-10 ? (
                                sortToEnd(a[keys[1]]) ? 1 : sortToEnd(b[keys[1]]) ? -1 : (
                                    Math.abs(b[keys[1]] - a[keys[1]]) < 1e-10 ? 0 : b[keys[1]] - a[keys[1]]
                                )
                            ) : b[keys[0]] - a[keys[0]]
                        )
                    ) : b[key] - a[key]
                )
            );
        }
    }


    // Filter
    let lastFilterKey = null;

    function filterChange() {
        if (courseRenderResult.length === 0) return;
        const key = this.value.trim();
        // if word not finish
        if (key.length > 0 && !key.match(/^[\u4E00-\u9FFF（）\w -]+$/g)) return;

        // if same
        if (lastFilterKey === key) return;
        lastFilterKey = key;
        const keys = key.split(' ');

        sortKey = null;
        courseRenderResultFilter.length = 0;
        courseRenderResultSort.length = 0;
        for (/**@type{[CourseData, HTMLElement]}*/const i of courseRenderResult) {
            if (findIfContains(i[0].courseName, keys) ||
                findIfContains(i[0].serialNumber, keys) ||
                i[0].instructors && i[0].instructors.find(i => findIfContains(i instanceof Object ? i.name : i, keys))
            ) {
                courseRenderResultFilter.push(i);
                courseRenderResultSort.push(i[1]);
            }
        }
        searchResultSignal.update();
    }

    function findIfContains(data, keys) {
        if (!data) return false;
        for (const key of keys)
            if (key.length === 0 || data.indexOf(key) !== -1) return true;
        return false;
    }


    function onkeyup(e) {
        if (e.key === 'Enter') search();
    }

    // Select menu
    const deptNameSelectMenu = new SelectMenu('dept', 'Dept Name');

    courseSearch = div('courseSearch',
        {onRender, onPageClose, onPageOpen},
        courseSearchForm = div('form',
            // input(null, 'Serial number', 'serial', {onkeyup}),
            input(null, 'Course name', 'courseName', {onkeyup}),
            deptNameSelectMenu,
            input(null, 'Instructor', 'instructor', {onkeyup}),
            input(null, 'DayOfWeak', 'dayOfWeek', {onkeyup}),
            input(null, 'Grade', 'grade', {onkeyup}),
            input(null, 'Section', 'section', {onkeyup}),
            button(null, 'search', search),
            button(null, 'get watched course', getWatchCourse),
        ),
        table('result', {cellPadding: 0},
            colgroup(null,
                col(null),
                // col(null, {'style': 'visibility: collapse'}),
            ),
            State(searchResultSignal, renderSearchResult),
            thead('noSelect',
                tr(null,
                    th(null, null,
                        // Filter options
                        div('filterSection',
                            div(null, div('options',
                                img('./res/assets/funnel_icon.svg'),
                                div('filter', input(null, 'Teacher, Course name, Serial number', null, {
                                    oninput: filterChange,
                                    onpropertychange: filterChange
                                })),
                                div('resultCount',
                                    span('Result count: '),
                                    courseSearchResultCount = span()
                                ),
                            )),
                        ),
                        div('expandDownArrow', expandArrowImage.cloneNode()),
                    ),
                    th('Dept', 'departmentName', {key: 'departmentName', onclick: sortStringKey}),
                    th('Serial', 'serialNumber', {key: 'serialNumber', onclick: sortStringKey}),
                    th('Type', 'courseType', {key: 'courseType', onclick: sortStringKey}),
                    th('Class', 'class', {key: 'classInfo', onclick: sortStringKey}),
                    th('Time', 'courseTime', {key: 'timeString', onclick: sortStringKey}),
                    th('Course name', 'courseName', {key: 'courseName', onclick: sortStringKey}),
                    th('Credits', 'credits', {key: 'credits', onclick: sortIntKey}),
                    th('Sel/Avail', 'available', {key: 'available', onclick: sortIntKey}),
                    // NckuHub
                    th('Reward', 'nckuhub', {key: 'got', onclick: sortNckuhubKey}),
                    th('Sweet', 'nckuhub', {key: 'sweet', onclick: sortNckuhubKey}),
                    th('Cool', 'nckuhub', {key: 'cold', onclick: sortNckuhubKey}),
                    th('Options', 'options'),
                ),
            ),
        ),
        instructorInfoBubble,
        instructorDetailWindow,
        nckuhubDetailWindow,
    );
    return courseSearch;
};

function InstructorInfoElement(/**@param{UrSchoolInstructorSimple}*/{
    recommend, reward, articulate, pressure, sweet,
    averageScore, note, nickname, department, jobTitle, rollCallMethod, qualifications
}) {
    return div('instructorInfo',
        div('rate',
            recommend !== -1 && reward !== -1 && articulate !== -1 && pressure !== -1 && sweet !== -1
                ? table(null,
                    tr(null, th('Recommend'), th('Reward'), th('Articulate'), th('Pressure'), th('Sweet')),
                    tr(null, td(recommend, getColor(recommend)), td(reward, getColor(reward)), td(articulate, getColor(articulate)), th(pressure, getColor(5 - pressure)), td(sweet, getColor(sweet))),
                )
                : null,
        ),
        div('info',
            table(null,
                tr(null, th('Average score'), td(averageScore)),
                tr(null, th('Note'), td(note)),
                tr(null, th('Nickname'), td(nickname)),
                tr(null, th('Department'), td(department)),
                tr(null, th('Job title'), td(jobTitle)),
                tr(null, th('Roll call method'), td(rollCallMethod)),
            ),
        ),
        span('Academic qualifications: ' + qualifications),
    );
}

function InstructorInfoBubble() {
    const signal = new Signal();
    const classList = new ClassList('instructorInfoOffset');
    const offsetElement = div(classList,
        State(signal, /**@param{target:any, data: UrSchoolInstructorSimple, offsetY: float}state*/state => {
            if (!state) return div();

            const bound = state.target.getBoundingClientRect();
            /**@type UrSchoolInstructorSimple*/
            const instructor = state.data;
            const element = InstructorInfoElement(instructor);
            element.insertBefore(span(instructor.name), element.firstChild);

            offsetElement.style.left = bound.left + 'px';
            offsetElement.style.top = (bound.top + state.offsetY - 40) + 'px';
            classList.add('show');
            return element;
        })
    );
    offsetElement.set = signal.set;
    offsetElement.hide = () => classList.remove('show');
    return offsetElement;
}

function InstructorDetailWindow() {
    return PopupWindow(/**@param{UrSchoolInstructor}instructor*/instructor => {
        const instructorInfo = InstructorInfoElement(instructor.info);
        return div('instructorDetailWindow',
            div('title',
                span('Evaluation for'),
                div('name',
                    span(instructor.info.department),
                    span(instructor.info.name),
                    span(instructor.info.jobTitle),
                ),
            ),
            div('tags',
                instructor.tags.map(i => {
                    return span(i[1]);
                })
            ),
            div('reviewerCount',
                span('Total votes'),
                span(instructor.reviewerCount.toString()),
            ),
            instructorInfo,
            div('comments',
                instructor.comments.map(i => {
                    return div('item',
                        img(`https://graph.facebook.com/v2.8/${i.profile}/picture?type=square`, 'profile'),
                        div('body',
                            span(i.created_at, 'createDate'),
                            span(i.body, 'message'),
                        ),
                    );
                })
            ),
        );
    });
}

function getColor(number) {
    return number < 2 ? 'red' : number < 4 ? 'yellow' : 'blue';
}

function NckuhubDetailWindow() {
    return PopupWindow(/**@param{NckuHub}nckuhub*/nckuhub => {
        return div('nckuhubDetailWindow',
            // rates
            span(`Evaluation(${nckuhub.rate_count})`, 'title'),
            nckuhub.rate_count === 0 ? div('rates') : div('rates',
                div(null, div('rateBox',
                    span('Reward'),
                    span(nckuhub.got.toFixed(1)),
                )),
                div(null, div('rateBox',
                    span('Sweetness'),
                    span(nckuhub.sweet.toFixed(1)),
                )),
                div(null, div('rateBox',
                    span('Cool'),
                    span(nckuhub.cold.toFixed(1)),
                )),
            ),
            // comment
            span(`Comments(${nckuhub.comments.length})`, 'title'),
            div('comments',
                nckuhub.comments.map(comment => div('commentBlock',
                    span(comment.semester, 'semester'),
                    p(comment.comment, 'comment'),
                )),
            ),
            // span(JSON.stringify(nckuhub, null, 2)),
        );
    });
}

function PopupWindow(onDataChange) {
    const popupSignal = new Signal();
    const popupClass = new ClassList('popupWindow');
    const closeButton = button('closeButton', null, () => popupClass.remove('open'), div('icon'));
    const popupWindow = div(popupClass, State(popupSignal, state => {
        if (!state) return div();
        const body = onDataChange(state);
        body.insertBefore(closeButton, body.firstChild);
        popupClass.add('open');
        return body;
    }));
    popupWindow.set = popupSignal.set;
    return popupWindow;
}

function sortToEnd(data) {
    return data === null || data === undefined || data.length === 0;
}