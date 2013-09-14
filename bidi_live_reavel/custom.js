// we want strict javascript that fails
// on ambiguous syntax
"using strict";

// to prevent timeout
requirejs.config({
    waitSeconds: 60
});


//Define bidiweb functions
requirejs.config({
    shim: {
        'bidiweb.html_css': ['bidiweb'],
        'bidiweb.css': ['bidiweb']
    }
});



// do not use notebook loaded  event as it is re-triggerd on
// revert to checkpoint but this allow extension to be loaded
// late enough to work.

$([IPython.events]).on('app_initialized.NotebookApp', function(){

    //Intilize bidiweb
     require(['custom/bidiweb'],function(css){
        bidiweb.css('.rendered_html *');
     })

     require(['custom/bidiweb'],function(html_css){

	IPython.MarkdownCell.prototype.render =  function () {
        if (this.rendered === false) {
		console.log('bidiweb my render false');
            var text = this.get_text();
            var math = null;
            if (text === "") { text = this.placeholder; }
            var text_and_math = IPython.mathjaxutils.remove_math(text);
            text = text_and_math[0];
            math = text_and_math[1];
            var html = marked.parser(marked.lexer(text));
            html = bidiweb.html_css(html);
            html = $(IPython.mathjaxutils.replace_math(html, math));

            // links in markdown cells should open in new tabs
            html.find("a[href]").not('[href^="#"]').attr("target", "_blank");
            try {
                this.set_rendered(html);
            } catch (e) {
                console.log("bidiweb Error running Javascript in Markdown:");
                console.log(e);
                this.set_rendered($("<div/>").addClass("js-error").html(
                    "Error rendering Markdown!<br/>" + e.toString())
                );
            }
            this.element.find('div.text_cell_input').hide();
            this.element.find("div.text_cell_render").show();
            this.typeset()
            this.rendered = true;
        }
    };

     })

     require(['custom/livereveal/main'],function(livereveal){
    //
    //       // livereveal.parameters('theme', 'transition', 'fontsize');
    //       // * theme can be: simple, sky, beige, serif, solarized
    //       // (you will need aditional css for default, night, moon themes).
    //       // * transition can be: linear, zoom, fade, none
    //       // (aditional transitions are cube, page, concave, default).
    //       // * fontsize is in % units, ie. you can choose 150% or 200%
    //
       livereveal.parameters('beige', 'cube', '150%');
    //
       console.log('Live reveal extension loaded correctly')
    //
     })

});
