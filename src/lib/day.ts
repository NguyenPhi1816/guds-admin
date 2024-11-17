// src/lib/day.ts
import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
dayjs.locale("vi");
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
const day = dayjs;
export default day;
