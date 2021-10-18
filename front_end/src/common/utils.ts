export default class UTILS {

    // 格式化字符串: ${key}替换为{value}
    static formatStr(str: string, dict: any): string {
        if (str.length > 0) {
            Object.keys(dict).forEach(function (key) {
                if (dict[key] !== undefined) {
                    let reg = new RegExp("(\\${" + key + "})", "g");
                    str = str.replace(reg, dict[key]);
                }
            });
        }
        return str;
    }

    static strIsEmpty(str: string): boolean {
        return !str || str === '';
    }

    static copyProperty(src: Record<string, string | string[]>, fields: (number | string)[] | null): any {
        let desc;
        if (!fields || fields.length === 0) {
            desc = JSON.parse(JSON.stringify(src));
        } else {
            desc = JSON.parse(JSON.stringify(src, fields));
        }
        return desc;
    }

    static shuffle(arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            if (i !== randomIndex) {
                [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
            }
        }
    }
}