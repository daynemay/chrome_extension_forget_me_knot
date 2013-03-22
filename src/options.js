// Copyright (c) 2013. All rights reserved.

var reminders = {};
var hideHelp = false;

// Wait until the page is loaded
if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", init, false);
}

// TODO: Make lastTriggered persist properly 
// TODO: Record a YouTube video and link from there
// TODO: Make the popup show (only) the matching reminders for this page
// TODO: Make the popup update when you switch tabs with it open
// TODO: Make the delete buttons actually work
// TODO: Insert Google Analytics for various pages/events

function makeTableRow(table, id)
{
    // Make a row in the table for this reminder 
    table.append('<tr id="row_' + id +'">' + 
        '<td><div class="save button button_remove" id="button_remove_' + id + '"><img src="images/remove.png" class="small_image_button"/></div></td>' + 
        '<td><select class="save select_match_type" id="select_match_type_' + id + '">' +
            '<option value="title">Title</option>' + 
            '<option value="URL">URL</option>' +
        '</select></td>' +
        '<td><input class="save input_match" id="input_match_' + id + '"/><button class="button_get_current" id="button_get_current_' + id + '">&lt;</button></td>' +
        '<td><input class="save input_text" id="input_text_' + id + '"/></td>' +
        '<td><input class="save input_title" id="input_title_' + id + '"/></td>' +
        '<td><input class="save input_frequency" id="input_frequency_' + id + '" min="1" max="9999" maxlength="4" type="number"/>' +
        '<select class="save select_freq_type" id="select_freq_type_' + id + '">' + 
            '<option value="1">seconds</option>' + 
            '<option value="60">minutes</option>' + 
            '<option value="3600">hours</option>' + 
            '<option value="86400">days</option>' + 
            '<option value="604800">weeks</option>' + 
        '</select></td>' +
        '</tr>');

    var freqTitle = "Maximum frequency to show this reminder - stops too many pop-ups if you change tabs a lot";

    $(".select_match_type").attr("title", "How to match tabs against the pattern");

    $(".input_match").attr("placeholder", "Regex pattern");
    $(".input_match").attr("title", "Regex pattern to check when changing tabs");
    $(".input_text").attr("placeholder", "Reminder text");
    $(".input_text").attr("title", "Reminder to pop up for matching URLs");
    $(".input_title").attr("placeholder", "Reminder title");
    $(".input_title").attr("title", "Title of pop-up reminder for matching pages");
    $(".input_frequency").attr("placeholder", "Limit");
    $(".input_frequency").attr("title", freqTitle);
    $(".select_freq_type").attr("title", freqTitle);
    $(".button_remove").attr("title", "Delete this reminder");

    // Bind remove button to delete ID
    $('.button_remove').unbind('click');
    $('.button_remove').click(function(){
        // Get reminder ID based on button_remove_ID
	var id = parseReminderID($(this).attr("id"), "button_remove_");
        reminders[id].deleted = true;
        var row_id = "#row_" + id;
        $(row_id).hide("slow");
        // TODO: Consolidate these two lines into a function?
        console.log("reminders before", reminders);
        getRemindersFromTable($("#reminders_table"));
        console.log("reminders after get", reminders);

        chrome.storage.sync.set({'SiteReminders': reminders, 'Reload': true}, function(){});
    });
    $('.button_remove').hover(function(){
        var id = parseReminderID($(this).attr("id"), 'button_remove_');
        var row_id = "#row_" +id;
        $(row_id).addClass("pendingDelete");
    }, function() {
        var id = parseReminderID($(this).attr("id"), 'button_remove_');
        var row_id = "#row_" +id;
        $(row_id).removeClass("pendingDelete");
    });

    // Save whenever anything changes
    $(".save").unbind("change");
    $(".save").bind("change", function(){
        // TODO: Consolidate these two lines into a function?
        console.log(111);
        getRemindersFromTable($("#reminders_table"));
        console.log(222);
        console.log("saving", reminders);
        chrome.storage.sync.set({'SiteReminders': reminders, 'Reload': true}, function(){});
    });

    // Change tooltip of 'get current' button and reminder text based on match type
    $('.select_match_type').unbind('change');
    $('.select_match_type').change(function(){
        // Get reminder ID based on select_match_type_ID
        var id = parseReminderID($(this).attr('id'), 'select_match_type_');
        $("#button_get_current_" + id).attr("title", "Get " + $(this).val() + " of currently selected tab");
        $("#input_text_" + id).attr("title", "Reminder to pop up for matching " + $(this).val() + "s");
    });
    // Trigger the above to set tooltips now
    $('.select_match_type').change();

        // Bind "get current" button to get current URL or title
        $('.button_get_current').unbind('click');
        $('.button_get_current').click(function(){

        // Get reminder ID based on button_get_current_ID 
        var id = parseReminderID($(this).attr('id'), 'button_get_current_');

        var matchType = $("#select_match_type_" + id).val();

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            if(tabs.length > 0)
            {
                $("#input_match_" + id).val(matchType == 'title' ? tabs[0].title : tabs[0].url);
            }
        });
    });

    // Annoying manual handling of input type="number"
    $(".input_frequency").each(function(){
        this.oninput = function () {
            if (this.value.length > this.maxLength)
            {
                this.value = this.value.slice(0,this.maxLength); 
            }
        }
    });

}

function init(){

    chrome.storage.sync.get('SiteReminders', function(value) { 
        reminders = value['SiteReminders'];
        for(var id in reminders)
        {
            var reminder = reminders[id];

            // Make a row in the table for this reminder 
            makeTableRow($("#reminders_table"), id);

            // Populate the table row with this reminder
            $("#input_match_" + id).val(reminder.matchPattern);
            $("#input_text_" + id).val(reminder.reminderText);
            $("#input_title_" + id).val(reminder.reminderTitle);
            $("#input_frequency_" + id).val(reminder.maxFrequency);
            $("#select_freq_type_" + id).val(reminder.freqMultiplier);
            $("#select_match_type_" + id).val(reminder.matchType);
        }

    });

    chrome.storage.sync.get('HideHelp', function(value) { 
        hideHelp = value['HideHelp'];
        if (hideHelp)
        {
            $("#help_text").hide();
        }
    });

    $("#got_it").bind("click", function(){
        $("#help_text").hide("slow");
        hideHelp = true;
        chrome.storage.sync.set({'HideHelp': true}, function(){})
    });

    $("#button_restore_help").bind("click", function(){
        hideHelp = false;
        $("#help_text").show("slow");
        chrome.storage.sync.set({'HideHelp': false}, function(){})
    });

    $("#button_add").click(function(){
        var empty_row = false;
        var id = null;

        // Call row empty if reminder text hasn't been set
        empty_row = $('#reminders_table tr:last .input_text').val() == ''

        // Reuse empty rows, rather than adding again.
        if(empty_row)
        {
            // Get ID of empty input_match in empty last row
            var input_match_id = $('#reminders_table tr:last .input_match').attr("id");
            // Get reminder ID based on input_match_ID 
            id = parseReminderID(input_match_id, 'input_match_');
        }
        else
        {
            id = generateGuid(); // in common.js
            makeTableRow($("#reminders_table"), id);
        }

        var input_match = $("#input_match_" + id);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ if(tabs.length > 0){input_match.val(tabs[0].title)}});

        $("#select_match_type_" + id).val("title"); 
        $("#input_title_" + id).val("Forget Me Knot!");
        $("#input_frequency_" + id).val(30);
        $("#select_freq_type_" + id).val(60); // i.e. minutes

        // Go into the row
        $("#input_text_" + id).focus();

	// TODO: Show a tooltip or similar if you're being prompted to edit existing empty rather than create new

    });

}

function getRemindersFromTable(table)
{
    var rows = table.get(0).rows;

    for(var i=0; i<rows.length; i++)
    { 
        // Ignore header row
        if (rows[i].id.substring(0, 4) != 'row_') { continue; }

        // Get reminder ID based on row_ID 
        id = parseReminderID(rows[i].id, 'row_'); 

        if (id in reminders && reminders[id].deleted)
        {
            console.log("deleting a reminder" + id);
            delete reminders[id];
            continue;
        }

        // Create new reminder
        if(!(id in reminders))
        {
            reminders[id] = {};
            reminders[id]['id'] = id;
        }

        reminders[id]['reminderText'] = $("#input_text_" + id).val();
        reminders[id]['reminderTitle'] = $("#input_title_" + id).val();
        reminders[id]['matchPattern'] = $("#input_match_" + id).val();
        reminders[id]['maxFrequency'] = $("#input_frequency_" + id).val();
        reminders[id]['freqMultiplier'] = $("#select_freq_type_" + id).val();
        reminders[id]['matchType'] = $("#select_match_type_" + id).val();
    
    }

}
