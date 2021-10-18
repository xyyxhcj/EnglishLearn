// @ts-ignore
import moment, {Moment, MomentInput} from "moment";
import CONSTS from "@/common/consts";

function concatZero(str: string): string {
    return ('00' + str).substr(str.length);
}

export default class DATE_UTILS {

    static formatDate(dateStr: number | string, fmt: string = CONSTS.CONFIG.DATE_FORMAT): string {
        if (!dateStr) {
            return '';
        }
        const date = new Date(dateStr);
        if (/(Y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        const o = {
            'M+': date.getMonth() + 1,
            'D+': date.getDate(),
            'H+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S': date.getMilliseconds()
        };
        for (const k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : concatZero(str));
            }
        }
        return fmt;
    }

    static dataRangeChange(start: string, end: string, query: any): Promise<void> {
        return new Promise<void>((resolve) => {
            query.start = start;
            query.end = end;
            resolve();
        });
    }

    static getMomentTime(isEnd: boolean): moment.Moment {
        let input: moment.MomentInput;
        if (isEnd) {
            input = CONSTS.CONFIG.DATA_CONCAT_END;
        } else {
            input = CONSTS.CONFIG.DATA_CONCAT_BEGIN;
        }
        return moment(input, 'HH:mm:ss');
    }

    static getMoment(input: MomentInput): moment.Moment | undefined {
        if (!input) {
            return undefined;
        }
        return moment(input);
    }
}