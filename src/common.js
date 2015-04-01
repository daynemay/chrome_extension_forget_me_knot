// We should be safe from the same user generating multiple reminders in the same millisecond.
function generateReminderID(){
  return new Date().getTime().toString();
}

/*  If my_input_id is "input_match_1234", then:
        parseReminderID(my_input.attr("id"), "input_match_") 
   should yield the reminder ID "1234" */
function parseReminderID(other_id, prefix) {
    return other_id.substring(prefix.length);
}

/* multipliers is a dictionary of int:name
 * 1: second
 * 60: minute
 * 3600: hour
 * 86400: day
 * whatever 7 * 86400 is: week */
var multipliers = {
    1: "second",
    60: "minute",
    3600: "hour",
    86400: "day",
    604800: "week"
};

function getMultiplierName(count, mult)
{
    var rv = ""
    if (mult in multipliers)
    {
        rv = multipliers[mult];
        if (count != 1) rv += "s";
    }
    return rv;
}
