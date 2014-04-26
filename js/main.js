// namespace
var COS = {
   // default endpoint address
   endpointUrl : "http://api.hackjak.bappedajakarta.go.id/apbd?apiKey=pNv2ktU89DC8PeD7fO3wT1BAWD9nNome",

   columns : [ {
      name : "year",
      type : "number"
   }, {
      name : "SKPDNama",
      type : "string"
   }, {
      name : "urusan",
      type : "string"
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
         if (_.isUndefined(v) || _.isNull(v)) {
            return 0
         }
         else {
            v = v.replace(/\,/g, '');
            return (isNaN(v)) ? 0 : parseFloat(v);
         }
      }
   }, {
      name : "realisasi",
      type : "number",
      // Get rid the thousand separator symbols from realisasi
      before : function(v) {
         if (_.isUndefined(v) || _.isNull(v)) {
            return 0
         }
         else {
            v = v.replace(/\,/g, '');
            return (isNaN(v)) ? 0 : parseFloat(v);
         }
      }
   } ],

   // configuration parameters that are used throughout the application:
   config : {
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
       
      // Define the maximum number of groups to be included in the chart at any time
      maxGroups : 20,
      
      categoryColors : [ "#CF3D1E", "#F15623", "#F68B1F", "#FFC60B", "#DFCE21", "#BCD631", "#95C93D", "#48B85C",
            "#00833D", "#00B48D", "#60C4B1", "#27C4F4", "#478DCB", "#3E67B1", "#4251A3", "#59449B", "#6E3F7C",
            "#6A246D", "#8A4873", "#EB0080", "#EF58A0", "#C05A89" ]
   },

   // state management
   state : {
      // Store the year of the currently selected period
      currentYear : "2013",

      // Store the name of the "urusan" by which the data is initially sliced: "Pendidikan"
      currentSector : "1.01",

      // Store the name of the region by which the data is initially sliced: "ALL"
      currentRegion : ".",

      // Store the name of the column by which the data is initially grouped: "namaProgram"
      currentGrouping : "namaProgram"
   },

   Dataset : {},

   // container for our application views
   Views : {},

   // application router
   Router : Backbone.Router.extend(
   { 
      routes : {
         "" : "index",
         "main" : "index",
         "realisasi" : "monitor"
      },

      index : function()
      {
         // Define the underlying dataset for this interactive diagram.
         if (_.isUndefined(COS.Dataset) || _.isNull(COS.Dataset) || _.isEmpty(COS.Dataset)) {
            COS.Dataset = COS.Utils.createDataset(COS.state.currentSector, COS.state.currentYear);      
            COS.Dataset.fetch(
            {
               success : function() {
                  COS.header = new COS.Views.Header();
                  COS.app = new COS.Views.Main();
                  COS.header.render();
                  COS.app.render();
               },
               error : function() {
                  COS.app.views.title.update("Failed to load data from " + data.url);
               }
            });
         }
         else {
            COS.app = new COS.Views.Main();
            COS.app.render();
         }
      },

      monitor : function()
      {
         // Define the underlying dataset for this interactive diagram.
         if (_.isUndefined(COS.Dataset) || _.isNull(COS.Dataset) || _.isEmpty(COS.Dataset)) {
            COS.Dataset = COS.Utils.createDataset(COS.state.currentSector, COS.state.currentYear);      
            COS.Dataset.fetch(
            {
               success : function() {
                  COS.header = new COS.Views.Header();
                  COS.app = new COS.Views.Main();
                  COS.header.render();
                  COS.app.render();
               },
               error : function() {
                  COS.app.views.title.update("Failed to load data from " + data.url);
               }
            });
         }
         else {
            COS.app = new COS.Views.Main();
            COS.app.render();
         }
      }
   })
};

/**
 * Application parser
 */
COS.ResultParser = function(options) {};

_.extend(COS.ResultParser.prototype, Miso.Parsers.prototype, {
   parse : function(data) {
      // we really only want to grab a few data points from the entire api call result.
      var columns     = ['year', 'SKPDNama', 'urusan', 'namaUrusan', 'program', 'programKode', 'namaProgram', 'kegiatanId', 'namaKegiatan', 'nilai', 'realisasi'];
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
             nilai : [],
             realisasi : [] };

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
         dataColumns.realisasi.push(c.realisasi);
      });

      return {
         columns : columns,
         data    : dataColumns
      };
   }
});

COS.Views.Header = Backbone.View.extend(
{
   initialize : function()
   {
      this.views = {};
   },

   render : function()
   {
      this.views.regions = new COS.Views.RegionSelection();
      this.views.sectors = new COS.Views.SectorSelection();
      this.views.periods = new COS.Views.YearPeriod();

      this.views.regions.render();
      this.views.sectors.render();
      this.views.periods.render();
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
      this.views.budgetBarTitle = new COS.Views.BudgetBarTitle();
      this.views.treemap = new COS.Views.Treemap();
      this.views.donut = new COS.Views.Donut();
      this.views.stackedBar = new COS.Views.StackedBar();

      this.views.title.render();
      this.views.budgetBarTitle.render();
      this.views.treemap.render();
      this.views.donut.render();
      this.views.stackedBar.render();
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

COS.Views.BudgetBarTitle = Backbone.View.extend(
{
   el : "#budgetBarLegend",
   initialize : function(options)
   {
      options = options || {};
      this.defaultMessage = "Alokasi dan Realisasi Anggaran Belanja Daerah DKI Jakarta";
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
      this.$el.trigger('chosen:updated')
      return this;
   },

   // Whenever the dropdown option changes, re-render the chart.
   onChange : function(e)
   {
      COS.state.currentRegion = $("option:selected", e.target).val();
      COS.app.views.treemap.render();
      COS.app.views.donut.render();
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
      this.$el.trigger('chosen:updated')
      return this;
   },

   // Whenever the dropdown option changes, re-render the chart.
   onChange : function(e)
   {
      COS.state.currentSector = $("option:selected", e.target).val();
      if (COS.state.currentSector == '1.20' && COS.state.currentYear == '2013') {
        COS.state.currentSector = '1.2';
      }
      else if (COS.state.currentSector == '1.10' && COS.state.currentYear == '2013') {
        COS.state.currentSector = '1.1';
      }
      else if (COS.state.currentSector == '1.2' && COS.state.currentYear == '2014') {
        COS.state.currentSector = '1.20';
      }
      else if (COS.state.currentSector == '1.1' && COS.state.currentYear == '2014') {
        COS.state.currentSector = '1.10';
      }

      COS.Dataset = COS.Utils.createDataset(COS.state.currentSector, COS.state.currentYear);
      COS.Dataset.fetch(
      {
         success : function() {
            COS.app.views.treemap.render();
            COS.app.views.donut.render();
            COS.app.views.stackedBar.render();
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

   el : '#year',
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
      this.$el.trigger('chosen:updated')
      return this;
   },

   onChange : function(e)
   {
      COS.state.currentYear = $("option:selected", e.target).val();
      if (COS.state.currentSector == '1.20' && COS.state.currentYear == '2013') {
        COS.state.currentSector = '1.2';
      }
      else if (COS.state.currentSector == '1.10' && COS.state.currentYear == '2013') {
        COS.state.currentSector = '1.1';
      }
      else if (COS.state.currentSector == '1.2' && COS.state.currentYear == '2014') {
        COS.state.currentSector = '1.20';
      }
      else if (COS.state.currentSector == '1.1' && COS.state.currentYear == '2014') {
        COS.state.currentSector = '1.10';
      }

      COS.Dataset = COS.Utils.createDataset(COS.state.currentSector, COS.state.currentYear);
      COS.Dataset.fetch(
      {
         success : function() {
            COS.app.views.treemap.render();
            COS.app.views.donut.render();
            COS.app.views.stackedBar.render();
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
   el : "#budgetChart",

   initialize : function(options)
   {
      this.width = $("#budgetChart").width();
      this.height = $("#budgetChart").height();
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
      var dataset = COS.Utils.computeBudgetByProgram();

      // === build data for d3
      var expenseData =
      {
         name : grouping,
         elements : []
      };

      dataset.each(function(row, index) {
         if (index >= maxGroups) {
            return;
         }
         expenseData.elements.push(
         {
            name : row[grouping],
            total : row["nilai"],
            color : COS.config.categoryColors[index % COS.config.categoryColors.length]
         });
      });

      // Build a treemap chart using the supplied data.
      // - Add labels to each cell, applying dynamic styling according to the space available.
      // - Bind custom handlers to cell highlighting and selection events.
      this.$el.empty();
      var selected = null;

      var layout = d3.layout.treemap().sort(function(a, b) {
         return a.value - b.value;
      })
      .children(function(d) {
         return d.elements;
      })
      .size([ this.width, this.height ]).value(function(d) {
         return d.total;
      });

      // var m_width = $("#chart").width();
      // 
      // var chart = d3.select("#chart").append("svg")
      //           .attr("preserveAspectRatio", "xMidYMid")
      //           .attr("viewBox", "0 0 " + this.width + " " + this.height)
      //           .attr("width", m_width)
      //           .attr("height", m_width * this.height / this.width).append("div")

      var chart = d3.select("#budgetChart").append("div")
        
      // set default styles for chart
      .call(function()
      {
         this.attr("class", "chart")
         .style("position", "relative");
      });

      // set up data for the chart
      chart.data([expenseData]).selectAll("div").data(function(d)
      {
         return layout.nodes(d);
      })
      .enter().append("div")

      // append a div for every piece of the treemap
      .call(function()
      {
         this.attr("class", "cell")
         .style("left", function(d) {
            return d.x + "px";
         })
         .style("top", function(d) {
            return d.y + "px";
         })
         .style("width", function(d) {
            return d.dx - 1 + "px";
         })
         .style("height", function(d) {
            return d.dy - 1 + "px";
         })
         .style("background", function(d) {
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

      // on mouseover, fade all cells except the one being selected.
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
      })
      .append("p")

      // set the size for the labels for the rupiah amount.
      .call(function()
      {
         this.attr("class", "tag").style("font-size", function(d) {
            return d.area > 55000 ? "14px" : d.area > 20000 ? "12px" : d.area > 13000 ? "10px" : "0px";
         })
         .style("text-transform", function(d) {
            return d.area > 20000 ? "none" : "uppercase";
         });
      })

      // append rupiah amounts
      .html(function(d)
      {
         return "<span class='cost'>" + COS.Utils.toMoney(d.value.toFixed(0)) + "</span>" + COS.Utils.toTitleCase(d.name);
      });

      // some graceful animation
      this._hideGroup("#budgetChart .cell");
      this._showGroup("#budgetChart .cell", 300, 10);
   }
});

/**
 * A donut chart to present the overall budget comparison between the actual spending
 * against the budget reminder.
 */
COS.Views.Donut = Backbone.View.extend(
{
   el : "#budgetDonut",

   initialize : function(options)
   {
      this.width = $("#budgetDonut").width();
      this.height = $("#budgetDonut").height();
      this.radius = Math.min(this.width, this.height) / 2;
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
      var dataset = COS.Utils.computeBudgetSpendingBySector();

      var spendingData = [];

      dataset.each(function(row, index) {
         spendingData[0] = row["realisasi"],
         spendingData[1] = row["nilai"] - row["realisasi"]
      });
      
      var labels = ['Realisasi', 'Sisa Anggaran'];

      this.$el.empty();

      var color = d3.scale.category20();

      var pie = d3.layout.pie().sort(null);

      var arc = d3.svg.arc()
                  .innerRadius(this.radius - 120)
                  .outerRadius(this.radius - 30);

      var svg = d3.select("#budgetDonut").append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height);

      var donut = svg.append("g")
                  .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

      var label = svg.append("g")
                  .attr("class", "label")
                  .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
     
      var donutPath = donut.selectAll("path")
                  .data(pie(spendingData))
                  .enter().append("path")
                  .attr("fill", function(d, i) { return color(i); })
                  .attr("d", arc);

      var donutLabel = label.selectAll("text")
                  .data(pie(spendingData));
      
      donutLabel.enter().append("text")
                  .attr("class", "donutLabel")
                  .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
                  .attr("text-anchor", "middle")
                  .text(function(d, i) { return labels[i]; } );

      // some graceful animation
      this._hideGroup("#budgetDonut");
      this._showGroup("#budgetDonut", 300, 10);
   }
});

/**
 * A bar chart to present the budget of each program between the actual spending
 * against the budget reminder.
 */
COS.Views.StackedBar = Backbone.View.extend(
{
   el : "#budgetBarImg",

   initialize : function(options)
   {
      this.width = $("#budgetBarImg").width();
      this.height = $("#budgetBarImg").height();
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
      var dataset = COS.Utils.computeBudgetSpendingByProgram();
      var spendingData = [];

      dataset.each(function(row, index) {
         var inner = [];
         inner[0] = row["namaProgram"],
         inner[1] = row["nilai"],
         inner[2] = row["realisasi"],
         spendingData[index] = inner
      });
      // var labels = ['Realisasi', 'Sisa Anggaran'];

      var remapped = ["c1", "c2"].map(function(dat, i) {
         return spendingData.map(function(d, ii) {
            return { x: d[i], y: d[i+1] };
         })
      });

      x = d3.scale.ordinal().rangeRoundBands([0, this.width - 50])
      y = d3.scale.linear().range([0, this.height - 50])
      z = d3.scale.category20();
    
      this.$el.empty();
	console.log(remapped);

      var stacked = d3.layout.stack()(remapped);


console.log(stacked);
      x.domain(stacked[0].map(function(d) { return d.x; }));
      y.domain([0, d3.max(stacked[stacked.length - 1], function(d) {
         return d.y0 + d.y;
      })]);

      var svg = d3.select("#budgetBarImg").append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height);

      var stackedBar = svg.append("g")
                  .attr("transform", "translate(" + 40 + "," + (this.height - 40) + ")");

      var valGroup = stackedBar.selectAll("g.valgroup")
           .data(stacked)
           .enter().append("g")
           .attr("class", "valgroup")
           .style("fill", function(d, i) { return z(i); })
           .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });
      
      var rect = valGroup.selectAll("rect")
           .data(function(d) { return d; })
           .enter().append("rect")
           .attr("class", "bar")
           .attr("x", function(d) { return x(d.x); })
           .attr("y", function(d) { return -y(d.y0) - y(d.y); })
           .attr("height", function(d) { return y(d.y); })
           .attr("width", x.rangeBand());           

      // on mouse over, fade the graphic bar
      rect.on("mouseover", function(d)
	  {
		console.log(d);
		 COS.app.views.budgetBarTitle.update(COS.Utils.toTitleCase(d.x) + " - " + COS.Utils.toMoney(d.y.toFixed(0)));
         $(".bar").stop().fadeTo(300, 0.2);
         $(this).stop().fadeTo(0, 1.0);
      })

      // on mouse out, unfade all bars.
      .on("mouseout", function(d)
      {
         $(".bar").stop().fadeTo("fast", 1.0);
         COS.app.views.title.update();
      })
      .append("p")
 
      // var donutLabel = label.selectAll("text")
      //             .data(pie(spendingData));
      // 
      // donutLabel.enter().append("text")
      //             .attr("class", "donutLabel")
      //             .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")"; })
      //             .attr("text-anchor", "middle")
      //             .text(function(d, i) { return labels[i]; } );

      // some graceful animation
      this._hideGroup("#budgetBarImg");
      this._showGroup("#budgetBarImg", 300, 10);
   }
});

// Random Utility functions
COS.Utils =
{
   // Create a new dataset with the given endpoint URL
   createDataset : function(sector, year) {
      return new Miso.Dataset(
      {
         url : "data/data24.json",
         // url : COS.endpointUrl + "&urusan=" + sector + "&year=" + year + "&per_page=250",
         columns : COS.columns,
         parser : COS.ResultParser,
      });
   },

   // Return the string supplied with its first character converted to upper case
   toTitleCase : function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
   },

   // Format currency values for display using the required prefix and separator
   toMoney : function(amount) {
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
   computeBudgetByProgram : function() {
      // load state
      var region = COS.state.currentRegion,
          grouping = COS.state.currentGrouping,

      // How are we selecting rows from the dataset
      dataSlice = function(row) {
         var regionRegex = new RegExp(region);
         return regionRegex.test(row["SKPDNama"]);
      };

      var dataset = COS.Dataset.rows(dataSlice).groupBy(grouping, ["nilai"]);

      dataset.sort(
      {
         comparator : function(a, b) {
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

      return dataset;
   },

   computeBudgetSpendingBySector : function() {
      // load state
      var region = COS.state.currentRegion,

      // How are we selecting rows from the dataset
      dataSlice = function(row) {
         var regionRegex = new RegExp(region);
         return regionRegex.test(row["SKPDNama"]);
      };

      var dataset = COS.Dataset.rows(dataSlice).groupBy("urusan", ["nilai", "realisasi"]);

      return dataset;
   },

   computeBudgetSpendingByProgram : function() {
      // load state
      var region = COS.state.currentRegion,
          grouping = COS.state.currentGrouping,

      // How are we selecting rows from the dataset
      dataSlice = function(row) {
         var regionRegex = new RegExp(region);
         return regionRegex.test(row["SKPDNama"]);
      };

      var dataset = COS.Dataset.rows(dataSlice).groupBy(grouping, ["nilai", "realisasi"]);

      dataset.sort(
      {
         comparator : function(a, b) {
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

      return dataset;
   }
};

// Kick off application.
var mainRoute = new COS.Router();
Backbone.history.start();
