// Copyright (c) 2013. All rights reserved.

var ForgetMeKnot = {

    reminders: {},
    hideHelp: false,
    delete_ids: [],

    // TODO: Make saving (esp. changes, i.e. edits, not add/delete) work
	// TODO: Record a YouTube video and link from there
	// TODO: Make the popup show (only) the matching reminders for this page
	// TODO: Make the popup update when you switch tabs with it open
	// TODO: Insert Google Analytics for various pages/events

    saveRemindersFromTable: function()
    {
        ForgetMeKnot.getRemindersFromTable($("#reminders_table"));
        chrome.storage.sync.set({'SiteReminders': ForgetMeKnot.reminders, 'Reload': true}, function(){});
    },

    makeTableRow: function (table, id)
    {
	    // Make a row in the table for this reminder 
	    table.append('<tr class="row" id="row_' + id +'">' + 
		'<td><div class="save button button_remove" id="button_remove_' + id + '"><img src="images/remove.png" class="small_image_button"/></div></td>' + 
		'<td><select class="save select_match_type" id="select_match_type_' + id + '">' +
		    '<option value="title">Title</option>' + 
		    '<option value="URL">URL</option>' +
		'</select></td>' +
		'<td><input class="save input_match" id="input_match_' + id + '"/></td>' +

		'<td><div id="combo_' + id + '" class="combo comboNormal">' + 
            '<div><input class="save input_title" id="input_title_' + id + '"/></div>' + 
            '<div><textarea rows="1" cols="40" class="save input_text" id="input_text_' + id + '"/></div>' + 
        '</div></td>' +
        

//		'<td><textarea rows="1" cols="30" class="save input_text" id="input_text_' + id + '"/></td>' +
//		'<td><input class="save input_title" id="input_title_' + id + '"/></td>' +
		'<td class="td_frequency"><input class="save input_frequency" id="input_frequency_' + id + '" min="1" max="9999" maxlength="4" type="number"/>' +
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

	    $(".input_match").attr("placeholder", "Pattern");
	    $(".input_match").attr("title", "Pattern to check when changing tabs");
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
   
            ForgetMeKnot.delete_ids.push(id);

    		var row_id = "#row_" + id;
    		$(row_id).hide("fast");
            ForgetMeKnot.saveRemindersFromTable();
            // $("#button_remove_" +id).change();

    		// TODO: Does the button_remove.change() above get rid of the need for this? chrome.storage.sync.set({'SiteReminders': ForgetMeKnot.reminders, 'Reload': true}, function(){});
	    });
        
        // When hovering over "remove" buttons, highlight the row that will be deleted
	    $('.button_remove').hover(
            function(){ // Hover in function
        		var id = parseReminderID($(this).attr("id"), 'button_remove_');
        		var row_id = "#row_" +id;
        		$(row_id).addClass("pendingDelete");
    	    }, 
            function() { // Hover out function
        		var id = parseReminderID($(this).attr("id"), 'button_remove_');
        		var row_id = "#row_" +id;
        		$(row_id).removeClass("pendingDelete");
	    });

/** TODO: Delete         // TODO: Comment
        $(".row").hover(function(){
            var id = parseReminderID($(this).attr("id"), "row_");
            $("#combo_" + id).removeClass("comboNormal");
            $("#combo_" + id).addClass("comboFocussed");
        }, function(){
            var id = parseReminderID($(this).attr("id"), "row_");
            $("#combo_" + id).removeClass("comboFocussed");
            $("#combo_" + id).addClass("comboNormal");
        }); ***/

	    // Save whenever anything changes
	    $(".save").unbind("change");
	    $(".save").bind("change", function(){
            ForgetMeKnot.saveRemindersFromTable();
	    });

	    // Change tooltip of 'get current' button and reminder text based on match type
	    $('.select_match_type').unbind('change');
	    $('.select_match_type').change(function(){
            // Get reminder ID based on select_match_type_ID
            var id = parseReminderID($(this).attr('id'), 'select_match_type_');
            $("#input_text_" + id).attr("title", "Reminder to pop up for matching " + $(this).val() + "s");
	    });

	    // Trigger the above to update tooltips now
	    $('.select_match_type').change();

        // More room for inputting text
        $('.input_text').unbind('focus');
        $('.input_text').bind('focus', function(){
            this.rows = 4;
        });
        $('.input_text').unbind('blur');
        $('.input_text').bind('blur', function(){
            this.rows = 1;
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

    },

    init: function(){

        chrome.storage.sync.get('SiteReminders', function(value) { 
            console.log("loading", value['SiteReminders']);
            ForgetMeKnot.reminders = value['SiteReminders'] || {};
            for(var id in ForgetMeKnot.reminders)
            {
                var reminder = ForgetMeKnot.reminders[id];

                // Make a row in the table for this reminder 
                ForgetMeKnot.makeTableRow($("#reminders_table"), id);

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
            this.hideHelp = value['HideHelp'] || false;
            if (this.hideHelp)
            {
                $("#help_text").hide();
            }
        });

        $("#add_example_1").bind("click", ForgetMeKnot.addExampleOne);
        $("#add_example_2").bind("click", ForgetMeKnot.addExampleTwo);

        $("#got_it").bind("click", function(){
            $("#help_text").hide("slow");
            this.hideHelp = true;
            chrome.storage.sync.set({'HideHelp': true}, function(){})
        });

        $("#button_restore_help").bind("click", function(){
            this.hideHelp = false;
            $("#help_text").show("slow");
            chrome.storage.sync.set({'HideHelp': false}, function(){})
        });

        $("#button_add").click(function(){
            var empty_row = false;
            var id = null;

            // Call row empty if reminder text hasn't been set
            empty_row = $('#reminders_table tr:last .input_text').val() == ''

            // Reuse empty rows, rather than adding again.
            if(false && empty_row)
            {
                // Get ID of empty input_match in empty last row
                var input_match_id = $('#reminders_table tr:last .input_match').attr("id");
                // Get reminder ID based on input_match_ID 
                id = parseReminderID(input_match_id, 'input_match_');
            }
            else
            {
                id = generateReminderID(); // in common.js
                ForgetMeKnot.makeTableRow($("#reminders_table"), id);
            }

            var input_match = $("#input_match_" + id);

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ if(tabs.length > 0){input_match.val(tabs[0].title)}});

            $("#select_match_type_" + id).val("title"); 
            // $("#input_title_" + id).val("Forget Me Knot!");
            $("#input_frequency_" + id).val(30);
            $("#select_freq_type_" + id).val(60); // i.e. minutes

            // Go into the row
            $("#input_title_" + id).focus();

            // TODO: Show a tooltip or similar if you're being prompted to edit existing empty rather than create new

        });

    },

    addExampleOne: function()
    {
        ForgetMeKnot.addExampleRow('title', 'XKCD for Jean', 'xkcd', 'Email physics-related XKCD comics to Jean for a laugh', 30, 86400);
    },

    addExampleTwo: function()
    {
        ForgetMeKnot.addExampleRow('title', 'Is Zac on LinkedIn yet?', 'LinkedIn', 'See if Zac has created an account yet', 3, 7 * 86400);
    },

    addExampleRow: function(match_type, title, match, text, frequency, freq_type)
    {           
        id = generateReminderID(); // in common.js
        ForgetMeKnot.makeTableRow($("#reminders_table"), id);
        $("#select_match_type_" + id).val(match_type); 
        $("#input_title_" + id).val(title);
        $("#input_match_" + id).val(match);
        $("#input_text_" + id).val(text);
        $("#input_frequency_" + id).val(frequency);
        $("#select_freq_type_" + id).val(freq_type);
        ForgetMeKnot.saveRemindersFromTable();
    },

    getRemindersFromTable: function (table)
    {
        var rows = table.get(0).rows;

        for(var i=0; i<rows.length; i++)
        { 
	        // Ignore header row
            if (rows[i].id.substring(0, 4) != 'row_') { continue; }

            // Get reminder ID based on row_ID 
		    id = parseReminderID(rows[i].id, 'row_'); 

    		if(id in ForgetMeKnot.delete_ids)
            {
    		    if (id in ForgetMeKnot.reminders) 
                {
                    delete ForgetMeKnot.reminders[id];
                }
                // TODO: Make deletes work
                continue;
            }

    		// Create new reminder
            if(!(id in ForgetMeKnot.reminders))
    		{
    		    ForgetMeKnot.reminders[id] = {};
    		    ForgetMeKnot.reminders[id]['id'] = id;
    		}

    		ForgetMeKnot.reminders[id]['reminderText'] = $("#input_text_" + id).val();
    		ForgetMeKnot.reminders[id]['reminderTitle'] = $("#input_title_" + id).val();
    		ForgetMeKnot.reminders[id]['matchPattern'] = $("#input_match_" + id).val();
    		ForgetMeKnot.reminders[id]['maxFrequency'] = $("#input_frequency_" + id).val();
    		ForgetMeKnot.reminders[id]['freqMultiplier'] = $("#select_freq_type_" + id).val();
    		ForgetMeKnot.reminders[id]['matchType'] = $("#select_match_type_" + id).val();

	    }
	}
}

// Wait until the page is loaded
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", ForgetMeKnot.init, false);
}

