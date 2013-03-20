// Copyright (c) 2013. All rights reserved.

var reminders = {};

// Wait until the page is loaded
if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
}

function makeTableRow(table, id)
{

    // Make a row in the table for this reminder 
    table.append('<tr id="row_' + id +'">' + 
        '<td><div class="display_match_type" id="display_match_type_' + id + '">' + '</div>' +
        '<td><div class="display_match" id="display_match_' + id + '"/>' + '</td>' +
        '<td><div class="display_title" id="display_title_' + id + '"/></td>' +
        '<td><div class="display_text" id="display_text_' + id + '"/></td>' +
        '</tr>');

}

function init(){

    // TODO: Update popup on change of tab, not just on init of popup

    chrome.storage.sync.get('SiteReminders', function(value) { 
        reminders = value['SiteReminders'];
        var title = "";
        var url = "";

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if(tabs.length<=0)
            {
                return;
            }

            title = tabs[0].title;
            url = tabs[0].url;

            for(var id in reminders)
            {
                // TODO: Fix and move to common.js; duplicated in background.js
                var reminder = reminders[id];
                var pattern = new RegExp(reminder.matchPattern,'');

                if (!((reminder.matchType == 'title' && pattern.test(title))
                      || (reminder.matchType == 'URL' && pattern.test(url))))
                {
                    continue;
                }

                // Make a row in the table for this reminder 
                makeTableRow($("#reminders_table"), id);

                // Populate the table row with this reminder
                $("#display_match_" + id).text(reminder.matchPattern);
                $("#display_text_" + id).text(reminder.reminderText);
                $("#display_title_" + id).text(reminder.reminderTitle);
                // TODO: Not as a tooltip
                $("#row_" + id).attr("title", reminder.maxFrequency + " " + getMultiplierName(reminder.maxFrequency, reminder.freqMultiplier));
            }
        });
    });

}
