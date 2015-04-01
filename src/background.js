// Listen for open of page on tab
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {checkForSiteReminder(tab)});

// Listen for change of active tab.
chrome.tabs.onHighlighted.addListener(function(changeInfo){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){ if(tabs){ checkForSiteReminder(tabs[0]); }});
});

var reminders = [];
loadReminders();

function saveReminder(reminder)
{  
    reminders[reminder.id] = reminder;
    chrome.storage.sync.set(
    { 
        "SiteReminders": reminders
    }, function() { 
           chrome.storage.sync.get("SiteReminders", function(value) { reminders = value['SiteReminders']}); } );
}

function checkForReload()
{
    chrome.storage.sync.get("Reload", function(value) { 
        if(value["Reload"])
	{
	    loadReminders();
	    chrome.storage.sync.set({"Reload": false}, function(){});
	}
    });
}    

function checkForSiteReminder(tab)
{

    checkForReload();

    var triggered = getSiteReminders(tab);

    var badgeText = "";
    var titleText = "Forget Me Knot!";

    if ( triggered.length > 0 ) 
    {
        badgeText = triggered.length.toString();
	titleText = triggered.length == 1 ?
		    "1 reminder matches this page" :
                    ( triggered.length + " reminders match this page" );
    }

    chrome.browserAction.setBadgeText({text: badgeText});
    chrome.browserAction.setTitle({title: titleText});

    for(var i=0; i<triggered.length; i++)
    {
        var reminder = triggered[i];
        var now = new Date().getTime();

        if (reminder.lastTriggered + 1000 * reminder.maxFrequency * reminder.freqMultiplier > now)
        {
            continue;
        }

        var notification = window.webkitNotifications.createNotification(
            chrome.extension.getURL('images/icon-48.png'), // The image.
            reminder.reminderTitle,                 // The title.
            reminder.reminderText                   // The body.
        );

        notification.show()        
        reminder.lastTriggered = now;
        saveReminder(reminder);
    }
}

function getSiteReminders(tab)
{
    var triggered = [];
    var title=tab.title;
    var url=tab.url;

    for(var id in reminders)
    {
        var reminder = reminders[id];
        var pattern = new RegExp(reminder.matchPattern,'');
        if (!((reminder.matchType == 'title' && pattern.test(title)) 
              || (reminder.matchType == 'URL' && pattern.test(url))))
        {
            continue;
        }
	triggered.push(reminder);
    }
    return triggered;

}

function loadReminders()
{
    chrome.storage.sync.get("SiteReminders", function(value) { 
        reminders = value['SiteReminders']
    });
}
