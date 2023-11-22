package com.wavjaby.api.search;

import com.wavjaby.json.JsonArrayStringBuilder;
import com.wavjaby.json.JsonObject;
import com.wavjaby.json.JsonObjectStringBuilder;

public class CourseData {
    final String semester;
    final String departmentName; // Can be null
    final String serialNumber; // Can be null
    final String courseAttribute;
    final String courseSystemNumber;
    final Integer forGrade;  // Can be null
    final String forClass; // Can be null
    final String group;  // Can be null
    final String category;  // Can be null
    final String courseName;
    final String courseNote; // Can be null
    final String courseLimit; // Can be null
    final TagData[] tags; // Can be null
    final Float credits; // Can be null
    final Boolean required; // Can be null
    final String[] instructors; // Can be null
    final Integer selected; // Can be null
    final Integer available; // Can be null
    final TimeData[] timeList; // Can be null
    final String moodle; // Can be null
    final String btnPreferenceEnter; // Can be null
    final String btnAddCourse; // Can be null
    final String btnPreRegister; // Can be null
    final String btnAddRequest; // Can be null


    public CourseData(JsonObject jsonObject) {
        // output
        this.semester = jsonObject.getString("y");
        this.departmentName = jsonObject.getString("dn");

        this.serialNumber = jsonObject.getString("sn");
        this.courseAttribute = jsonObject.getString("ca");
        this.courseSystemNumber = jsonObject.getString("cs");

        if (jsonObject.getObject("g") != null)
            this.forGrade = jsonObject.getInt("g");
        else
            this.forGrade = null;
        this.forClass = jsonObject.getString("co");
        this.group = jsonObject.getString("cg");

        this.category = jsonObject.getString("ct");

        this.courseName = jsonObject.getString("cn");
        this.courseNote = jsonObject.getString("ci");
        this.courseLimit = jsonObject.getString("cl");
        if (jsonObject.getObject("tg") != null)
            this.tags = jsonObject.getArray("tg").stream().map(i -> TagData.fromString((String) i)).toArray(TagData[]::new);
        else this.tags = null;

        if (jsonObject.getObject("c") != null)
            this.credits = jsonObject.getFloat("c");
        else this.credits = null;
        if (jsonObject.getObject("r") != null)
            this.required = jsonObject.getBoolean("r");
        else this.required = null;

        if (jsonObject.getObject("i") != null)
            this.instructors = jsonObject.getArray("i").stream().map(i -> (String) i).toArray(String[]::new);
        else this.instructors = null;

        if (jsonObject.getObject("s") != null)
            this.selected = jsonObject.getInt("s");
        else this.selected = null;
        if (jsonObject.getObject("a") != null)
            this.available = jsonObject.getInt("a");
        else this.available = null;

        if (jsonObject.getObject("t") != null)
            this.timeList = jsonObject.getArray("t").stream().map(i -> TimeData.fromString((String) i)).toArray(TimeData[]::new);
        else this.timeList = null;

        this.moodle = jsonObject.getString("m");
        this.btnPreferenceEnter = jsonObject.getString("pe");
        this.btnAddCourse = jsonObject.getString("ac");
        this.btnPreRegister = jsonObject.getString("pr");
        this.btnAddRequest = jsonObject.getString("ar");
    }

    public CourseData(String semester,
                      String departmentName,
                      String serialNumber, String courseAttribute, String courseSystemNumber,
                      Integer forGrade, String forClass, String group,
                      String category,
                      String courseName, String courseNote, String courseLimit, TagData[] tags,
                      Float credits, Boolean required,
                      String[] instructors,
                      Integer selected, Integer available,
                      TimeData[] timeList,
                      String moodle,
                      String btnPreferenceEnter, String btnAddCourse, String btnPreRegister, String btnAddRequest) {
        this.semester = semester;
        this.departmentName = departmentName;
        this.serialNumber = serialNumber;
        this.courseAttribute = courseAttribute;
        this.courseSystemNumber = courseSystemNumber;
        this.forGrade = forGrade;
        this.forClass = forClass;
        this.group = group;
        this.category = category;
        this.courseName = courseName;
        this.courseNote = courseNote;
        this.courseLimit = courseLimit;
        this.tags = tags;
        this.credits = credits;
        this.required = required;
        this.instructors = instructors;
        this.selected = selected;
        this.available = available;
        this.timeList = timeList;
        this.moodle = moodle;
        this.btnPreferenceEnter = btnPreferenceEnter;
        this.btnAddCourse = btnAddCourse;
        this.btnPreRegister = btnPreRegister;
        this.btnAddRequest = btnAddRequest;
    }

    public static class TagData {
        final String tag;
        final String colorID;
        final String url; // Can be null

        public TagData(String tag, String colorID, String url) {
            this.tag = tag;
            this.colorID = colorID;
            this.url = url;
        }

        public static TagData fromString(String raw) {
            String[] s = raw.split(",");
            return new TagData(s[0], s[1], s.length == 3 ? s[2] : null);
        }

        @Override
        public String toString() {
            if (url == null)
                return tag + ',' + colorID + ',';
            return tag + ',' + colorID + ',' + url;
        }
    }

    public static class TimeData {
        /**
         * Can be null, 0 ~ 6
         */
        final Byte dayOfWeek;
        /**
         * Can be null, 0 ~ 15
         */
        final Byte sectionStart;
        /**
         * Can be null, 0 ~ 15
         */
        final Byte sectionEnd;
        final String mapLocation; // Can be null
        final String mapRoomNo; // Can be null
        final String mapRoomName; // Can be null
        // Detailed time data
        final String detailedTimeData; // Can be null

        public TimeData(Byte dayOfWeek, Byte sectionStart, Byte sectionEnd,
                        String mapLocation, String mapRoomNo, String mapRoomName) {
            this.dayOfWeek = dayOfWeek;
            this.sectionStart = sectionStart;
            this.sectionEnd = sectionEnd;
            this.mapLocation = mapLocation;
            this.mapRoomNo = mapRoomNo;
            this.mapRoomName = mapRoomName;
            this.detailedTimeData = null;
        }

        public TimeData(String detailedTimeData) {
            this.dayOfWeek = null;
            this.sectionStart = null;
            this.sectionEnd = null;
            this.mapLocation = null;
            this.mapRoomNo = null;
            this.mapRoomName = null;
            this.detailedTimeData = detailedTimeData;
        }

        public static TimeData fromString(String raw) {
            String[] s = raw.split(",", 6);
            if(s.length == 1)
                return new TimeData(s[0]);
            return new TimeData(
                    s[0].isEmpty() ? null : Byte.parseByte(s[0]),
                    s[1].isEmpty() ? null : Byte.parseByte(s[1]),
                    s[2].isEmpty() ? null : Byte.parseByte(s[2]),
                    s[3], s[4], s[5]);
        }

        @Override
        public String toString() {
            if (detailedTimeData != null)
                return detailedTimeData;

            StringBuilder builder = new StringBuilder();
            if (dayOfWeek != null) builder.append(dayOfWeek);
            builder.append(',');
            if (sectionStart != null) builder.append(sectionStart);
            builder.append(',');
            if (sectionEnd != null) builder.append(sectionEnd);
            builder.append(',');
            if (mapLocation != null) builder.append(mapLocation);
            builder.append(',');
            if (mapRoomNo != null) builder.append(mapRoomNo);
            builder.append(',');
            if (mapRoomName != null) builder.append(mapRoomName);
            return builder.toString();
        }
    }

    private JsonArrayStringBuilder toJsonArray(Object[] array) {
        if (array == null) return null;
        JsonArrayStringBuilder builder = new JsonArrayStringBuilder();
        for (Object i : array)
            builder.append(i.toString());
        return builder;
    }

    @Override
    public String toString() {
        // output
        JsonObjectStringBuilder jsonBuilder = new JsonObjectStringBuilder();
        jsonBuilder.append("y", semester);
        jsonBuilder.append("dn", departmentName);

        jsonBuilder.append("sn", serialNumber);
        jsonBuilder.append("ca", courseAttribute);
        jsonBuilder.append("cs", courseSystemNumber);

        if (forGrade == null) jsonBuilder.append("g");
        else jsonBuilder.append("g", forGrade);
        jsonBuilder.append("co", forClass);
        jsonBuilder.append("cg", group);

        jsonBuilder.append("ct", category);

        jsonBuilder.append("cn", courseName);
        jsonBuilder.append("ci", courseNote);
        jsonBuilder.append("cl", courseLimit);
        jsonBuilder.append("tg", toJsonArray(tags));

        if (credits == null) jsonBuilder.append("c");
        else jsonBuilder.append("c", credits);
        if (required == null) jsonBuilder.append("r");
        else jsonBuilder.append("r", required);

        jsonBuilder.append("i", toJsonArray(instructors));

        if (selected == null) jsonBuilder.append("s");
        else jsonBuilder.append("s", selected);
        if (available == null) jsonBuilder.append("a");
        else jsonBuilder.append("a", available);

        jsonBuilder.append("t", toJsonArray(timeList));
        jsonBuilder.append("m", moodle);
        jsonBuilder.append("pe", btnPreferenceEnter);
        jsonBuilder.append("ac", btnAddCourse);
        jsonBuilder.append("pr", btnPreRegister);
        jsonBuilder.append("ar", btnAddRequest);
        return jsonBuilder.toString();
    }

    public String toStringShort() {
        // output
        JsonObjectStringBuilder jsonBuilder = new JsonObjectStringBuilder();
        jsonBuilder.append("sn", serialNumber);
        jsonBuilder.append("ca", courseAttribute);
        jsonBuilder.append("cs", courseSystemNumber);

        if (forGrade == null) jsonBuilder.append("g");
        else jsonBuilder.append("g", forGrade);
        jsonBuilder.append("co", forClass);
        jsonBuilder.append("cg", group);

        jsonBuilder.append("cn", courseName);

        jsonBuilder.append("i", toJsonArray(instructors));

        if (selected == null) jsonBuilder.append("s");
        else jsonBuilder.append("s", selected);
        if (available == null) jsonBuilder.append("a");
        else jsonBuilder.append("a", available);

        jsonBuilder.append("t", toJsonArray(timeList));
        return jsonBuilder.toString();
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getCourseSystemNumber() {
        return courseSystemNumber;
    }

    public String[] getInstructors() {
        return instructors;
    }

    public String getGroup() {
        return group;
    }

    public String getForClass() {
        return forClass;
    }

    public String getBtnAddCourse() {
        return btnAddCourse;
    }

    public String getBtnPreRegister() {
        return btnPreRegister;
    }

    public String getBtnAddRequest() {
        return btnAddRequest;
    }

    public String getTimeString() {
        if (timeList == null)
            return null;

        StringBuilder builder = new StringBuilder();
        for (TimeData i : timeList) {
            if (i.detailedTimeData != null || i.dayOfWeek == null) continue;
            if (builder.length() > 0)
                builder.append(',');

            builder.append('[').append(i.dayOfWeek + 1).append(']');
            if (i.sectionStart != null) {
                if (i.sectionEnd != null)
                    builder.append(i.sectionStart).append('~').append(i.sectionEnd);
                else
                    builder.append(i.sectionStart);
            }
        }
        return builder.toString();
    }

    public String getCourseName() {
        return courseName;
    }

    public Integer getSelected() {
        return selected;
    }

    public Integer getAvailable() {
        return available;
    }
}
