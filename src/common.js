/** Confession: this is lifted directly from a Google search on 
  * "javascript generate GUID". I haven't rigorously tested it, but I doubt the
  * consequences of failure are sufficiently drastic to lose sleep over it.
  */
function generateGuid() {
  var result, i, j;
  result = '';
  for(j=0; j<32; j++) {
    if( j == 8 || j == 12|| j == 16|| j == 20) 
      result = result + '-';
    i = Math.floor(Math.random()*16).toString(16).toUpperCase();
    result = result + i;
  }
  return result;
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
