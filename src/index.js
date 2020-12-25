import { Dimensions } from "react-native";
import { transform } from "css-viewport-units-transform";
import { process as mediaQueriesProcess } from "react-native-css-media-query-processor";
import memoize from "micro-memoize";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

function omit(obj, omitKey) {
    return Object.keys(obj).reduce((result, key) => {
        if (key !== omitKey) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

const omitMemoized = memoize(omit);

function bublUnitsTransform(obj, matchObject) {

    if (!obj) return obj;

    const styles = {};

    const moderateProps = [
        "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "paddingVertical", "paddingHorizontal",
        "marginLeft", "marginRight", "marginTop", "marginBottom", "marginVertical", "marginHorizontal",
        "borderWidth", "borderWidthTop", "borderWidthBottom", "borderWidthLeft", "borderWidthRight",
    ];
    const sacleProps = [
        "width", "maxWidth",
        "height", "maxHeight",
        "left", "right", "top", "bottom",
        "borderRadius", "borderRadiusTop", "borderRadiusBottom", "borderRadiusLeft", "borderRadiusRight",
    ];
    // const verticalProps = ["height", "maxHeight"];
    const fontProps = ["fontSize", "lineHeight"];

    Object.keys(obj).map(key => {

        const values = obj[key];

        styles[key] = {};

        Object.keys(values).map(prop => {

            let value = values[prop] || {};

            if (typeof value !== "number") {
                styles[key][prop] = value;
                return;
            }

            if (sacleProps.includes(prop)) {

                styles[key][prop] = scale(value);

            } else if (fontProps.includes(prop) || moderateProps.includes(prop)) {

                let factor = fontProps.includes(prop) ? 0.3 : 0.5;

                // value = value.toString().split(".", 3);

                // if (value.length === 3) {

                //     factor = parseFloat("0." + value[2]);

                //     value = parseFloat(value[0] + "." + value[1]);

                // } else if (value.length === 3) {

                //     factor = parseFloat("0." + value[1]);

                //     value = parseFloat(value[0]);

                // } else {

                //     value = parseFloat(value[0]);

                // }

                styles[key][prop] = moderateScale(value, factor);

            } else {

                styles[key][prop] = value;

            }

            return prop;

        });

    })

    return styles;

}

function viewportUnitsTransform(obj, matchObject) {
    const hasViewportUnits = "__viewportUnits" in obj;

    if (!hasViewportUnits) {
        return obj;
    }

    return transform(omitMemoized(obj, "__viewportUnits"), matchObject);

}

function mediaQueriesTransform(obj, matchObject) {
    const hasParsedMQs = "__mediaQueries" in obj;

    if (!hasParsedMQs) {
        return obj;
    }
    return mediaQueriesProcess(obj, matchObject);
}

export function process(obj) {
    const matchObject = getMatchObject();

    obj = mediaQueriesTransform(obj, matchObject);

    obj = bublUnitsTransform(obj, matchObject);

    obj = viewportUnitsTransform(obj, matchObject);

    return obj;

}

function getMatchObject() {
    const win = Dimensions.get("window");
    return {
        width: win.width,
        height: win.height,
        orientation: win.width > win.height ? "landscape" : "portrait",
        "aspect-ratio": win.width / win.height,
        type: "screen"
    };
}
