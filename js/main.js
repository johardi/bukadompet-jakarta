// namespace
var COS = {
   columns : [ {
      name : "year",
      type : "number"
   }, {
      name : "SKPDNama",
      type : "string"
   }, {
      name : "urusan",
      type : "string",
      // Handling inconsistency data for urusan code.
      before : function(v) {
         if (v == '1.1') { return "1.10"; }
         else if (v == '1.2') { return "1.20"; }
         else return v;
      }
   }, {
      name : "namaUrusan",
      type : "string"
   }, {
      name : "program",
      type : "string"
   }, {
      name : "programKode",
      type : "string"
   }, {
      name : "namaProgram",
      type : "string",
      // Get rid the bullet number from namaProgram
      before : function(v) {
         return v.replace(/^\s*[0-9]+\.\s*/, '');
      }
   }, {
      name : "kegiatanId",
      type : "string"
   }, {
      name : "namaKegiatan",
      type : "string"
   }, {
      name : "nilai",
      type : "number",
      // Get rid the thousand separator symbols from nilai
      before : function(v) {
         return (_.isUndefined(v) || _.isNull(v) || v == '-') ? 0 : parseFloat(v.replace(/\,/g, ''));
      }
   } ],

   // container for our application views
   Views : {},

   // application router
   Router : Backbone.Router.extend(
   { 
      routes : {
         "overview" : "index",
         "overview/:sector/:year" : "index"
      }, 
      index : function(sector, year)
      {
		 var year = (_.isUndefined(year)) ? "2013" : year;
		 var sector = (_.isUndefined(sector)) ? "1.01" : sector
		
         // configuration parameters that are used throughout the application:
         COS.config = {
	        // default endpoint address
	        endpointUrl : "http://api.hackjak.bappedajakarta.go.id/apbd?apiKey=pNv2ktU89DC8PeD7fO3wT1BAWD9nNome",
	
            // default dates, all.
            yearPeriod : [ "2013", "2014" ],
            
            regions : [
               { name : "Semua Wilayah", regex : "." },
               { name : "Jakarta Pusat", regex : "Jakarta Pusat|JAKPUS" },
               { name : "Jakarta Barat", regex : "Jakarta Barat|JAKBAR" },
               { name : "Jakarta Utara", regex : "Jakarta Utara|JAKUT" },
               { name : "Jakarta Timur", regex : "Jakarta Timur|JAKTIM" },
               { name : "Jakarta Selatan", regex : "Jakarta Selatan|JAKSEL" },
               { name : "Kep.Seribu", regex : "Kep.Seribu|Kep. Seribu" }
            ],

            sectors : [
               { code : "1.01", name : "Pendidikan" },
               { code : "1.02", name : "Kesehatan" },
               { code : "1.03", name : "Pekerjaan Umum" },
               { code : "1.04", name : "Perumahan Rakyat" },
               { code : "1.05", name : "Penataan Ruang" },
               { code : "1.06", name : "Perencanaan Pembangunan" },
               { code : "1.07", name : "Perhubungan" },
               { code : "1.08", name : "Lingkungan Hidup" },
               { code : "1.09", name : "Pertahanan" },
               { code : "1.10", name : "Kependudukan dan Catatan Sipil" },
               { code : "1.11", name : "Pemberdayaan Perempuan dan Perlindungan Anak" },
               { code : "1.12", name : "Keluarga Berencana dan Keluarga Sejahtera" },
               { code : "1.13", name : "Sosial" },
               { code : "1.14", name : "Ketenagakerjaan" },
               { code : "1.15", name : "Koperasi dan Usaha Kecil Menengah" },
               { code : "1.16", name : "Penanaman Modal" },
               { code : "1.17", name : "Kebudayaan" },
               { code : "1.18", name : "Pemuda dan Olahraga" },
               { code : "1.19", name : "Kesatuan Bangsa dan Politik Dalam Negeri" },
               { code : "1.20", name : "Otonomi Daerah dan Administrasi Daerah" },
               { code : "1.21", name : "Ketahanan Pangan" },
               { code : "1.22", name : "Pemberdayaan Masyarakat dan Desa (RW)" },
               { code : "1.23", name : "Statistik" },
               { code : "1.24", name : "Kearsipan" },
               { code : "1.25", name : "Komunikasi dan Informatika" },
               { code : "1.26", name : "Perpustakaan" },
               { code : "2.01", name : "Pertanian" },
               { code : "2.02", name : "Kehutanan" },
               { code : "2.03", name : "Energi dan Sumber Daya Mineral" },
               { code : "2.04", name : "Pariwisata" },
               { code : "2.05", name : "Perikanan, Kelautan dan Peternakan" },
               { code : "2.06", name : "Perdagangan" },
               { code : "2.07", name : "Industri" }
            ],

            // Define which columns the data can be grouped by: "namaProgram"
            groupings : [ COS.columns[6].name ],
            
            // Define the maximum number of groups to be included in the chart at any time
            maxGroups : 20,
            
            categoryColors : [ "#CF3D1E", "#F15623", "#F68B1F", "#FFC60B", "#DFCE21", "#BCD631", "#95C93D", "#48B85C",
                  "#00833D", "#00B48D", "#60C4B1", "#27C4F4", "#478DCB", "#3E67B1", "#4251A3", "#59449B", "#6E3F7C",
                  "#6A246D", "#8A4873", "#EB0080", "#EF58A0", "#C05A89" ]
         
         };
		
         // state management
         COS.state = {
            // Store the year of the currently selected period
            currentYear : year,

            // Store the name of the "urusan" by which the data is initially sliced: "Pendidikan"
            currentSector : sector,

            // Store the name of the region by which the data is initially sliced: "ALL"
            currentRegion : COS.config.regions[0]["regex"],

            // Store the name of the column by which the data is initially grouped: "namaProgram"
            currentGrouping : COS.config.groupings[0]
         };

         // Define the underlying dataset for this interactive diagram.
         COS.data = new Miso.Dataset(
         {
            url : COS.config.endpointUrl + "&urusan=" + COS.state.currentSector + "&year=" + COS.state.currentYear + "&per_page=250",
            // url : "data/data230.json",
            // url : "data/apbd-jakarta.json",
            columns : COS.columns,
            parser : COS.ResultParser,
         });

         COS.data.fetch(
         {
            success : function() {
               COS.app = new COS.Views.Main();
               COS.app.render();
            },
            error : function() {
               COS.app.views.title.update("Failed to load data from " + data.url);
            }
         });
      }
   })
};

/**
 * Application parser
 */
COS.ResultParser = function(options) {};

_.extend(COS.ResultParser.prototype, Miso.Parsers.prototype, {
   parse : function(data) {
      // we really only want to grab a few data points from the entire
      // api call result.
      var columns     = ['year', 'SKPDNama', 'urusan', 'namaUrusan', 'program', 'programKode', 'namaProgram', 'kegiatanId', 'namaKegiatan', 'nilai'];
      var dataColumns = {
             year : [], 
             SKPDNama : [], 
             urusan : [], 
             namaUrusan : [], 
             program : [], 
             programKode : [], 
             namaProgram : [], 
             kegiatanId : [], 
             namaKegiatan : [], 
             nilai : [] };

      var results = data.result;

      _.each(results, function(c) {
         dataColumns.year.push(c.year);
         dataColumns.SKPDNama.push(c.SKPDNama);
         dataColumns.urusan.push(c.urusan);
         dataColumns.namaUrusan.push(c.namaUrusan);
         dataColumns.program.push(c.program);
         dataColumns.programKode.push(c.programKode);
         dataColumns.namaProgram.push(c.namaProgram);
         dataColumns.kegiatanId.push(c.kegiatanId);
         dataColumns.namaKegiatan.push(c.namaKegiatan);
         dataColumns.nilai.push(c.nilai);
      });

      return {
         columns : columns,
         data    : dataColumns
      };
   }
});

/**
 * Main application view
 */
COS.Views.Main = Backbone.View.extend(
{
   initialize : function()
   {
      this.views = {};
   },

   render : function()
   {
      this.views.title = new COS.Views.Title();
      this.views.regions = new COS.Views.RegionSelection();
      this.views.sectors = new COS.Views.SectorSelection();
      this.views.periods = new COS.Views.YearPeriod();
      this.views.treemap = new COS.Views.Treemap();

      this.views.title.render();
      this.views.regions.render();
      this.views.sectors.render();
      this.views.periods.render();
      this.views.treemap.render();
   }
});

COS.Views.Title = Backbone.View.extend(
{
   el : "#legend",
   initialize : function(options)
   {
      options = options || {};
      this.defaultMessage = "Anggaran Belanja Daerah DKI Jakarta";
      this.message = options.message || this.defaultMessage;
      this.setElement($(this.el));
   },
   render : function()
   {
      this.$el.html(this.message);
   },
   update : function(message)
   {
      if (typeof message !== "undefined") {
         this.message = message;
      }
      else {
         this.message = this.defaultMessage;
      }
      this.render();
   }
});

COS.Views.RegionSelection = Backbone.View.extend(
{
   el : "#region",
   template : 'script#regionSelection',
   events : {
      "change" : "onChange"
   },

   initialize : function(options)
   {
      options = options || {};
      this.regions = options.regions || COS.config.regions;
      this.template = _.template($(this.template).html());
      this.setElement($(this.el));
   },

   render : function()
   {
      this.$el.addClass('dropdown');
      this.$el.parent().show();
      this.$el.html(this.template({
         selections : this.regions
      }));
      return this;
   },

   // Whenever the dropdown option changes, re-render
   // the chart.
   onChange : function(e)
   {
      COS.state.currentRegion = $("option:selected", e.target).val();
      COS.app.views.treemap.render();
   }
});

COS.Views.SectorSelection = Backbone.View.extend(
{
   el : "#sector",
   template : 'script#sectorSelection',
   events : {
      "change" : "onChange"
   },

   initialize : function(options)
   {
      options = options || {};
      this.sectors = options.sectors || COS.config.sectors;
      this.template = _.template($(this.template).html());
      this.setElement($(this.el));
   },

   render : function()
   {
      this.$el.addClass('dropdown');
      this.$el.parent().show();
      this.$el.html(this.template({
         selections : this.sectors
      }));
      return this;
   },

   // Whenever the dropdown option changes, re-render the chart.
   onChange : function(e)
   {
      COS.state.currentSector = $("option:selected", e.target).val();
	  COS.data = new Miso.Dataset(
      {
          url : COS.config.endpointUrl + "&urusan=" + COS.state.currentSector + "&year=" + COS.state.currentYear + "&per_page=250",
          columns : COS.columns,
          parser : COS.ResultParser,
      });
      COS.data.fetch(
      {
         success : function() {
            COS.app.views.treemap.render();
         },
         error : function() {
            COS.app.views.title.update("Failed to load data from " + data.url);
         }
      });
   }
});

/**
 * Date range dropdown containing all possible values.
 */
COS.Views.YearPeriod = Backbone.View.extend({

   el : '#period',
   template : 'script#yearPeriod',

   events : {
      "change" : "onChange"
   },

   initialize : function(options)
   {
      options = options || {};
      this.periods = options.periods || COS.config.yearPeriod;
      this.template = _.template($(this.template).html());
      this.setElement($(this.el));
   },

   render : function()
   {
      this.$el.addClass('dropdown');
      this.$el.parent().show();
      this.$el.html(this.template({
         yearPeriods : this.periods
      }));
      return this;
   },

   onChange : function(e)
   {
      COS.state.currentYear = $("option:selected", e.target).val();
      COS.data = new Miso.Dataset(
      {
          url : COS.config.endpointUrl + "&urusan=" + COS.state.currentSector + "&year=" + COS.state.currentYear + "&per_page=250",
          columns : COS.columns,
          parser : COS.ResultParser,
      });
      COS.data.fetch(
      {
         success : function() {
            COS.app.views.treemap.render();
         },
         error : function() {
            COS.app.views.title.update("Failed to load data from " + data.url);
         }
      });
   }
});

/**
 * A tree map, uses d3.
 */
COS.Views.Treemap = Backbone.View.extend(
{
   el : "#chart",

   initialize : function(options)
   {
      // options = options || {};
      this.width = $("#chart").width();
      this.height = $("#chart").height();
      this.setElement($(this.el));
   },

   _hideGroup : function(elType, fadeTime, offset)
   {
      if (fadeTime) {
         offset = offset || 0;
         $(elType).each(function(index)
         {
            $(this).delay(offset * index).fadeOut(fadeTime);
         });
      }
      else {
         $(elType).hide();
      }
   },

   _showGroup : function(elType, fadeTime, offset)
   {
      if (fadeTime) {
         offset = offset || 0;
         $(elType).each(function(index)
         {
            $(this).delay(offset * index).fadeIn(fadeTime);
         });
      }
      else {
         $(elType).show();
      }
   },

   render : function()
   {
      // load state
      var grouping = COS.state.currentGrouping,
          maxGroups = COS.config.maxGroups;

      // Create a data subset that we are rendering
      var groupedData = COS.Utils.computeGroupedData();

      // === build data for d3
      var expenseData = {
         name : grouping,
         elements : []
      };

      groupedData.each(function(row, index)
      {
         if (index >= maxGroups) {
            return;
         }
         expenseData.elements.push({
            name : row[grouping],
            total : row["nilai"],
            color : COS.config.categoryColors[index % COS.config.categoryColors.length]
         });
      });

      // === build d3 chart
      // Build a treemap chart with the supplied data (using D3 to create, size,
      // color and layout a series of DOM elements).
      // Add labels to each cell, applying dynamic styling choices according to
      // the space available.
      // Bind custom handlers to cell highlighting and selection events.
      this.$el.empty();
      var selected = null;

      var layout = d3.layout.treemap().sort(function(a, b)
      {
         return a.value - b.value;
      }).children(function(d)
      {
         return d.elements;
      }).size([ this.width, this.height ]).value(function(d)
      {
         return d.total;
      });

      // var m_width = $("#chart").width();
      // 
      // var chart = d3.select("#chart").append("svg")
      //           .attr("preserveAspectRatio", "xMidYMid")
      //           .attr("viewBox", "0 0 " + this.width + " " + this.height)
      //           .attr("width", m_width)
      //           .attr("height", m_width * this.height / this.width).append("div")


      var chart = d3.select("#chart").append("div")
        
      // set default styles for chart
      .call(function() {
               this.attr("class", "chart")
                   .style("position", "relative");
            });

      // set up data for the chart
      chart.data([expenseData]).selectAll("div").data(function(d)
      {
         return layout.nodes(d);
      }).enter().append("div")

      // append a div for every piece of the treemap
      .call(function()
      {
         this.attr("class", "cell").style("left", function(d)
         {
            return d.x + "px";
         }).style("top", function(d)
         {
            return d.y + "px";
         }).style("width", function(d)
         {
            return d.dx - 1 + "px";
         }).style("height", function(d)
         {
            return d.dy - 1 + "px";
         }).style("background", function(d)
         {
            return d.color || "#F7F7F7";
         });
      })

      // on click just output some logging
      .on("click", function(d)
      {
         if (selected) {
            selected.toggleClass("selection");
         }
         selected = $(this);
         selected.toggleClass("selection");
         console.log(d, selected);
      })

      // on mouseover, fade all cells except the one being
      // selected.
      .on("mouseover", function(d)
      {
         // update Title.
         COS.app.views.title.update(COS.Utils.toTitleCase(d.name) + " - " + COS.Utils.toMoney(d.value.toFixed(0)));
         $(".cell").stop().fadeTo(300, 0.2);
         $(this).stop().fadeTo(0, 1.0);
      })

      // on mouse out, unfade all cells.
      .on("mouseout", function(d)
      {
         $(".cell").stop().fadeTo("fast", 1.0);
         COS.app.views.title.update();
      }).append("p")

      // set the size for the labels for the dollar amount.
      // vary size based on size.
      .call(function()
      {
         this.attr("class", "tag").style("font-size", function(d)
         {
            return d.area > 55000 ? "14px" : d.area > 20000 ? "12px" : d.area > 13000 ? "10px" : "0px";
         }).style("text-transform", function(d)
         {
            return d.area > 20000 ? "none" : "uppercase";
         });
      })

      // append dollar amounts
      .html(function(d)
      {
         return "<span class='cost'>" + COS.Utils.toMoney(d.value.toFixed(0)) + "</span>" + COS.Utils.toTitleCase(d.name);
      });

      // some graceful animation
      this._hideGroup("#chart .cell");
      this._showGroup("#chart .cell", 300, 10);
   }
});

// Random Utility functions
COS.Utils = {
   // Return the string supplied with its first character converted to upper case
   toTitleCase : function(str)
   {
      return str.charAt(0).toUpperCase() + str.substr(1);
   },

   // Format currency values for display using the required prefix and separator
   toMoney : function(amount)
   {
      options = {
         symbol : "Rp",
         decimal : ",",
         thousand : ".",
         precision : 0
      };
      // we are using the accounting library
      return accounting.formatMoney(amount, options);
   },

   // Compute grouped data for a specific range, by the grouping.
   computeGroupedData : function()
   {
      // load state
      var period = COS.state.currentYear,
          region = COS.state.currentRegion,
          sector = COS.state.currentSector,
          grouping = COS.state.currentGrouping,
          maxGroups = COS.config.maxGroups,

      // How are we selecting rows from the dataset
      dataSlice = function(row) {
         var regionRegex = new RegExp(region);
         return (regionRegex.test(row["SKPDNama"])) && (row["urusan"] === sector) && (row["year"] == period);
      };

      var groupedData = COS.data.rows(dataSlice).groupBy(grouping, ["nilai"]);

      groupedData.sort({
         comparator : function(a, b)
         {
            if (b["nilai"] > a["nilai"]) {
               return 1;
            }
            if (b["nilai"] < a["nilai"]) {
               return -1;
            }
            if (b["nilai"] === a["nilai"]) {
               return 0;
            }
         }
      });

      return groupedData;
   }
};

// Kick off application.
var mainRoute = new COS.Router();
Backbone.history.start();
