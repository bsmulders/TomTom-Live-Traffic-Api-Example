/*

This file is part of TomTom-Live-Traffic-Api-Example

Copyright (c) 2012, Bobbie Smulders

Contact:  mail@bsmulders.com

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

*/
// Proj4js:
var projWGS84 = new Proj4js.Proj('WGS84');
var projEPSG900913 = new Proj4js.Proj('EPSG:900913');

Ext.onReady(function () {
	// Model describing a traffic incident record
	Ext.define('TrafficIncidentModel', {
		extend: 'Ext.data.Model',
		fields: [
		// JSON fields
		{
			name: 'id',
			type: 'string'
		}, {
			name: 'ic',
			type: 'int'
		}, {
			name: 'ty',
			type: 'int'
		}, {
			name: 'cs',
			type: 'string'
		}, {
			name: 'cpoi',
			type: 'string'
		}, {
			name: 'd',
			type: 'string'
		}, {
			name: 'f',
			type: 'string'
		}, {
			name: 't',
			type: 'string'
		}, {
			name: 'r',
			type: 'string'
		}, {
			name: 'l',
			type: 'string'
		}, {
			name: 'dl',
			type: 'string'
		}, {
			name: 'c',
			type: 'string'
		}, {
			name: 'px',
			type: 'float',
			mapping: 'p.x'
		}, {
			name: 'py',
			type: 'float',
			mapping: 'p.y'
		},
		// Generated fields
		{
			name: 'location',
			type: 'float',
			convert: function (value, record) {
				var p = new Proj4js.Point(record.get('px'), record.get('py'));
				Proj4js.transform(projEPSG900913, projWGS84, p);
				return (p.y).toFixed(5) + ',' + (p.x).toFixed(5);
			}
		}],
		// Create association for clustered points
		associations: [{
			type: 'hasMany',
			model: 'TrafficIncidentModel',
			name: 'cpoi',
			foreignKey: 'cpoi',
			autoload: true,
		}]
	});

	// JsonStore containing the JSON result
	Ext.create('Ext.data.Store', {
		storeId: 'TrafficIncidentJsonStore',
		proxy: {
			type: 'ajax',
			reader: {
				type: 'json',
				root: 'tm.poi',
			}
		},
		model: 'TrafficIncidentModel',
		listeners: {
			load: buildStore
		},
	});

	// Store containing the traffic incidents (filled from the JsonStore)
	Ext.create('Ext.data.Store', {
		storeId: 'TrafficIncidentStore',
		model: 'TrafficIncidentModel'
	});

	// Traffic incident window containing the traffic incident grid
	Ext.create('Ext.window.Window', {
		width: 1000,
		height: 500,
		title: 'Traffic incidents',
		closable: false,
		layout: 'fit',
		items: [{
			autoScroll: true,
			layout: 'fit',
			border: false,
			dockedItems: [{
				dock: 'top',
				xtype: 'toolbar',
				items: [{
					xtype: 'button',
					text: 'Refresh',
					iconCls: 'button-refresh',
					handler: onRefreshButton
				}, {
					xtype: 'button',
					text: 'Settings',
					iconCls: 'button-settings',
					handler: onSettingsButton
				}]
			}],
			items: [{
				xtype: 'gridpanel',
				border: false,
				id: 'TrafficGrid',
				store: 'TrafficIncidentStore',
				columns: [{
					header: 'ID',
					dataIndex: 'id',
					hidden: true
				}, {
					header: 'Road',
					dataIndex: 'r',
					width: 70
				}, {
					header: 'From',
					dataIndex: 'f',
					flex: 1
				}, {
					header: 'To',
					dataIndex: 't',
					flex: 1
				}, {
					header: 'Clustered Points',
					dataIndex: 'cs',
					hidden: true
				}, {
					header: 'Location',
					dataIndex: 'location',
					hidden: true
				}, {
					header: 'Description',
					dataIndex: 'd',
					hidden: true
				}, {
					header: 'Cause',
					dataIndex: 'c',
					hidden: true
				}, {
					header: 'Type',
					dataIndex: 'ic',
					width: 120,
					renderer: function (value, metaData, record, rowIndex, colIndex, store) {
						switch (value) {
						case 1:
							return 'Net yet defined';
						case 3:
							return 'Accident cleared';
						case 6:
							return 'Traffic jam';
						case 7:
							return 'Roadwork';
						case 8:
							return 'Accident';
						case 9:
							return 'Long-term roadwork';
						case 13:
							return 'Not yet defined';
						default:
							return 'Unknown';
						};
					}
				}, {
					header: 'Severity',
					dataIndex: 'ty',
					width: 100,
					renderer: function (value, metaData, record, rowIndex, colIndex, store) {
						switch (value) {
						case 0:
							return 'No delay';
						case 1:
							metaData.tdCls = 'severitySlow';
							return 'Slow traffic';
						case 2:
							metaData.tdCls = 'severityQueing';
							return 'Queing traffic';
						case 3:
							metaData.tdCls = 'severityStationary';
							return 'Stationary traffic';
						case 4:
							metaData.tdCls = 'severityClosed';
							return 'Closed';
						default:
							return 'Unknown';
						}
					}
				}, {
					header: 'Length',
					dataIndex: 'l',
					width: 60,
					renderer: function (value, metaData, record, rowIndex, colIndex, store) {
						metaData.tdCls = 'testing';

						return (value / 1000.0).toPrecision(2) + ' km';
					}
				}, {
					header: 'Duration',
					dataIndex: 'dl',
					width: 60,
					renderer: function (value, metaData, record, rowIndex, colIndex, store) {
						return (value / 60.0).toPrecision(2) + ' min';
					}
				}, ],
				plugins: [{
					ptype: 'rowexpander',
					rowBodyTpl: ['<dl class="incident"><dt>ID:</dt> <dd>{id}&nbsp;</dd>', '<tpl if="cs != 0">', '<dt>Clustered points:</dt> <dd>{cs}&nbsp;</dd>', '</tpl>', '<dt>Location:</dt> <dd><a href="http://maps.google.com/maps?ll={location}" title="Show location on Google Maps">{location}</a></dd>', '<tpl if="d">', '<dt>Description:</dt> <dd>{d}&nbsp;</dd>', '</tpl>', '<tpl if="c">', '<dt>Cause:</dt> <dd>{c}&nbsp;</dd>', '</tpl>', '</dl>'],
				}],
			}]
		}]
	}).show();

	// Settings window
	var settings = Ext.create('Ext.window.Window', {
		title: 'Change settings',
		height: 300,
		width: 250,
		bodyStyle: 'background-color: #FFF',
		layout: {
			type: 'vbox',
			align: 'stretch',
		},
		closeAction: 'hide',
		defaults: {
			margin: 2,
			layout: 'anchor',
			defaults: {
				anchor: '100%',
			},
		},
		items: [{
			xtype: 'fieldset',
			title: 'Bottom-left coordinates',
			items: [{
				xtype: 'textfield',
				fieldLabel: 'Latitude',
				value: '38.856820',
				id: 'tfBottomLeftLat'
			}, {
				xtype: 'textfield',
				fieldLabel: 'Longitude',
				value: '-77.052612',
				id: 'tfBottomLeftLong'
			}, ]
		}, {
			xtype: 'fieldset',
			title: 'Top-right coordinates',
			layout: 'anchor',
			defaults: {
				anchor: '100%',
			},
			items: [{
				xtype: 'textfield',
				fieldLabel: 'Latitude',
				value: '41.277806',
				id: 'tfTopRightLat'
			}, {
				xtype: 'textfield',
				fieldLabel: 'Longitude',
				value: '-73.048096',
				id: 'tfTopRightLong'
			}, ]
		}, {
			xtype: 'fieldset',
			title: 'Settings',
			items: [{
				xtype: 'numberfield',
				fieldLabel: 'Zoom amount',
				id: 'nfZoomAmount',
				value: '11',
				minValue: '2',
				maxValue: '17'
			}, {
				xtype: 'hiddenfield',
				id: 'hfProjection',
				value: 'EPSG900913'
			}, {
				xtype: 'combobox',
				fieldLabel: 'Language',
				id: 'cbLanguage',
				store: new Ext.data.Store({
					fields: ['abbr', 'name'],
					data: [{
						"abbr": "en",
						"name": "English"
					}, {
						"abbr": "de",
						"name": "German"
					}, {
						"abbr": "fr",
						"name": "French"
					}, {
						"abbr": "nl",
						"name": "Dutch"
					}, ]
				}),
				queryMode: 'local',
				displayField: 'name',
				valueField: 'abbr',
				value: 'en'
			}, {
				xtype: 'checkboxfield',
				fieldLabel: 'Expand clusters',
				checked: true,
				id: 'cbExpandClusters',
			}, ]
		}]
	});

	// Load listener for the TrafficIncidentStore
	function buildStore(sourceStore) {
		var destStore = Ext.getStore('TrafficIncidentStore');
		var expandClusters = sourceStore.proxy.url.substr(-18) == 'expandCluster=true';
		destStore.removeAll(false);

		sourceStore.each(function (record) {
			var cpoi = record.getAssociatedData().cpoi;

			// When the expandCluster checkbox is checked and
			// multiple children (cluster points) are found,
			// add only the children. Else, add the record itself
			if (expandClusters && cpoi.length > 0) {
				destStore.add(cpoi);
			} else {
				destStore.add(record);
			}
		});

		// Disable the loadmask on the traffic grid
		Ext.getCmp('TrafficGrid').setLoading(false);
	}

	// Handler function to update the settings
	function refreshGrid() {
		// Transform the coordinates to EPSG:900913
		var bl = new Proj4js.Point(
		parseFloat(Ext.getCmp('tfBottomLeftLong').getValue()), parseFloat(Ext.getCmp('tfBottomLeftLat').getValue()));
		var tr = new Proj4js.Point(
		parseFloat(Ext.getCmp('tfTopRightLong').getValue()), parseFloat(Ext.getCmp('tfTopRightLat').getValue()));
		Proj4js.transform(projWGS84, projEPSG900913, bl);
		Proj4js.transform(projWGS84, projEPSG900913, tr);

		// Build the service URI
		var url = 'http://www.tomtom.com/livetraffic/lbs/services/traffic/tm/1/' + bl.y + ',' + bl.x + ',' + tr.y + ',' + tr.x + '/' + Ext.getCmp('nfZoomAmount').getValue() + '/0,0,0,0/' + (new Date().getTime()) + '/json/2bbdd0e2-6452-494a-b6b6-5aceb39048eb;' + 'projection=' + Ext.getCmp('hfProjection').getValue() + ';' + 'language=' + Ext.getCmp('cbLanguage').getValue() + ';style=s3;' + 'expandCluster=' + (Ext.getCmp('cbExpandClusters').getValue() ? 'true' : 'false');
		var store = Ext.getStore('TrafficIncidentJsonStore');
		store.proxy.url = url;
		store.load();

		console.log(url);

		// Enable the loadmask on the traffic grid
		Ext.getCmp('TrafficGrid').setLoading(true);
	}

	function onSettingsButton() {
		settings.show();
	}

	function onRefreshButton() {
		refreshGrid();
	}

	function onCloseSettingsButton() {
		settings.hide();
	}
});