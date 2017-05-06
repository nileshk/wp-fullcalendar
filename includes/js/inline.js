var wpfc_loaded = false;
var wpfc_counts = {};
jQuery(document).ready( function($){
	var DIALOG_MAX_SIZE = 840;

	var eventSources = [{
		url: WPFC.ajaxurl,
		data: WPFC.data,
		ignoreTimezone: true,
		allDayDefault: false
	}];
	if (WPFC.google_calendar_api_key && WPFC.google_calendar_ids) {
		for (var i = 0; i < WPFC.google_calendar_ids.length; i++) {
			var calendarId = WPFC.google_calendar_ids[i];
			eventSources.push({googleCalendarId: calendarId});
		}
	}

	var fullcalendar_args = {
		timeFormat: WPFC.timeFormat,
		defaultView: WPFC.defaultView,
		weekends: WPFC.weekends,
		header: {
			left: WPFC.header.left,
			center: WPFC.header.center,
			right: WPFC.header.right
		},
		month: WPFC.month,
		year: WPFC.year,
		theme: WPFC.wpfc_theme,
		firstDay: WPFC.firstDay,
		editable: false,
		googleCalendarApiKey: WPFC.google_calendar_api_key,
		eventSources: eventSources,
		//eventRender: function(event, element) {
		eventClick: function (event, jsEvent, view) {
			if ((event.post_id > 0 || event.event_id) && WPFC.wpfc_qtips == 1) {
				var event_data = {action: 'wpfc_qtip_content', post_id: event.post_id, event_id: event.event_id};
				$.ajax({
					method: "POST",
					url: WPFC.ajaxurl,
					data: event_data
				}).done(function (data) {
					var w = $(window).width();
					if (w > DIALOG_MAX_SIZE) {
						w = DIALOG_MAX_SIZE;
					}
					var h = $(window).height() * 0.8;
					$('#wpfc-event-dialog')
						.html(data)
						.attr('title', event.title)
						.dialog({
							height: h,
							width: w,
							position: {my: "center", at: "center", of: window}
						});
				});
			} else { // Google Calendar
				var w = $(window).width();
				if (w > DIALOG_MAX_SIZE) {
					w = DIALOG_MAX_SIZE;
				}
				var h = $(window).height() * 0.8;

				var dateFormat = 'MMMM Do YYYY, h:mm:ss a';
				var dateFormatAllday = 'MMMM Do YYYY';
				var htmlDate;
				if (event.allDay) {
					htmlDate = '<strong>Date:</strong> ' + event.start.format(dateFormatAllday) + '<br/><br/>'
				} else {
					htmlDate = '<strong>Start:</strong> ' + event.start.format(dateFormat) + '<br/>'
					+'<strong>End:</strong> ' + event.end.format(dateFormat) + '<br/><br/>';

				}
				var htmlEventDescription = event.description ? event.description.replace(/$/mg,'<br/>') : '';
				var htmlDescription = htmlDate
					+ '<a href="' + event.url + '" target="_blank">View Event on Google Calendar</a><br/><br/>'
					+ '<hr style="margin-top: 20px; margin-right: 0px; margin-bottom: 20px; margin-left: 0px;">'
					+ htmlEventDescription;

				$('#wpfc-event-dialog')
					.html(htmlDescription)
					.attr('title', event.title)
					.dialog({
						height: h,
						width: w,
						position: {my: "center", at: "center", of: window}
					});
			}
			return false;
		},
		loading: function(bool) {
			if (bool) {
				$(this).parent().find('.wpfc-loading').show();
			}else {
				$(this).parent().find('.wpfc-loading').hide();
			}
		},
		viewRender: function(view, element) {
			if( !wpfc_loaded ){
				var container = $(element).parents('.wpfc-calendar-wrapper');
				container.find('.fc-toolbar').after(container.next('.wpfc-calendar-search').show());
				//catchall selectmenu handle
				$.widget( "custom.wpfc_selectmenu", $.ui.selectmenu, {
					_renderItem: function( ul, item ) {
						var li = $( "<li>", { html: item.label.replace(/#([a-zA-Z0-9]{3}[a-zA-Z0-9]{3}?) - /g, '<span class="wpfc-cat-icon" style="background-color:#$1"></span>') } );
						if ( item.disabled ) {
							li.addClass( "ui-state-disabled" );
						}
						return li.appendTo( ul );
					}
				});
				$('select.wpfc-taxonomy').wpfc_selectmenu({
					format: function(text){
						//replace the color hexes with color boxes
						return text.replace(/#([a-zA-Z0-9]{3}[a-zA-Z0-9]{3}?) - /g, '<span class="wpfc-cat-icon" style="background-color:#$1"></span>');
					},
					select: function( event, ui ){
						var calendar = $('.wpfc-calendar');
						menu_name = $(this).attr('name');
						$( '#' + menu_name + '-button .ui-selectmenu-text' ).html( ui.item.label.replace(/#([a-zA-Z0-9]{3}[a-zA-Z0-9]{3}?) - /g, '<span class="wpfc-cat-icon" style="background-color:#$1"></span>') );
						WPFC.data[menu_name] = ui.item.value;
						calendar.fullCalendar('removeEventSource', WPFC.ajaxurl);
						calendar.fullCalendar('addEventSource', {url : WPFC.ajaxurl, allDayDefault:false, ignoreTimezone: true, data : WPFC.data});
					}
				})
			}
			wpfc_loaded = true;
		}
	};
	if( WPFC.wpfc_locale ){
		$.extend(fullcalendar_args, WPFC.wpfc_locale);
	}
	$(document).trigger('wpfc_fullcalendar_args', [fullcalendar_args]);
	$('.wpfc-calendar').first().fullCalendar(fullcalendar_args);
});
