var wpfc_loaded = false;
var wpfc_counts = {};
jQuery(document).ready( function($){	
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
		eventSources: [{
				url : WPFC.ajaxurl,
				data : WPFC.data,
				ignoreTimezone: true,
				allDayDefault: false
		}],
	    eventRender: function(event, element) {
			if( event.post_id > 0 && WPFC.wpfc_qtips == 1 ){
				var event_data = { action : 'wpfc_qtip_content', post_id : event.post_id, event_id:event.event_id };
				element.qtip({
					content:{
						text : 'Loading...',
						ajax : {
							url : WPFC.ajaxurl,
							type : "POST",
							data : event_data
						}
					},
					position : {
						my: WPFC.wpfc_qtips_my,
						at: WPFC.wpfc_qtips_at
					},
					style : { classes:WPFC.wpfc_qtips_classes }
				});
			}
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
