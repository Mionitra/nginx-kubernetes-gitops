/*! ------------------------------------------------
 * Project Name: Axio Coming Soon Template
 * Project Description: Axio - awesome coming soon template to kick-start your project
 * Tags: mix_design, axio, coming soon, under construction, template, coming soon page, html5, css3
 * Version: 4.0.2
 * Build Date: April 2017
 * Last Update: December 2024
 * This product is available exclusively on Themeforest
 * Author: mix_design
 * Author URI: https://themeforest.net/user/mix_design
 * File name: app.js
 * ------------------------------------------------

 * ------------------------------------------------
 * Table of Contents
 * ------------------------------------------------
 *
 *  1. SVG Fallback
 *  2. Chrome Smooth Scroll
 *  3. Images moving ban
 *  4. PhotoSwipe Gallery Images Replace
 *  5. Main Menu & Sections Behavior
 *  6. Popups Behavior
 *
 * ------------------------------------------------
 * Table of Contents End
 * ------------------------------------------------ */

 $(function() {

   // SVG Fallback
   if(!Modernizr.svg) {
     $("img[src*='svg']").attr("src", function() {
       return $(this).attr("src").replace(".svg", ".png");
     });
   };

   // Chrome Smooth Scroll
   try {
     $.browserSelector();
     if($("html").hasClass("chrome")) {
       $.smoothScroll();
     }
   } catch(err) {
   };

   // Images moving ban
   $("img, a").on("dragstart", function(event) { event.preventDefault(); });

   // PhotoSwipe Gallery Images Replace
   $('.works-link')
     // Background set up
     .each(function(){
     $(this)
     // Add a photo container
     .append('<div class="picture"></div>')
     // Set up a background image for each link based on data-image attribute
     .children('.picture').css({'background-image': 'url('+ $(this).attr('data-image') +')'});
   });

   // Main Menu, Sections and Popups Behavior
   var menu = $('#menu'),
       menuTrigger = $('#menu-trigger'),
       menuClose = $('#menu-close'),
       stayintouchTrigger = $('#stayintouch-trigger'),
       stayintouch        = $('.stayintouch'),
       stayintouchClose   = $('#stayintouch-close'),
       asideContent       = $('.aside__content'),
       notify             = $('#notify'),
       notifyTrigger      = $('#notify-trigger'),
       notifyClose        = $('#notify-close'),
       intro              = $('#intro'),
       homeTrigger        = $('#home-trigger'),
       aboutTrigger       = $('#about-trigger'),
       worksTrigger       = $('#works-trigger'),
       contactTrigger     = $('#contact-trigger'),
       aboutSection       = $('#about'),
       worksSection       = $('#works'),
       contactSection     = $('#contact'),
       aboutClose         = $('#about-close'),
       worksClose         = $('#works-close'),
       contactClose       = $('#contact-close');

   // Stay-in-touch Form Open
   stayintouchTrigger.on('click', function(event){
     event.preventDefault();
     asideContent.addClass('animate-out');
     if(stayintouch.hasClass('animate-out')) {
       stayintouch.removeClass('animate-out');
     }
     setTimeout(function(){
       stayintouch.addClass('animate-in');
       if($('html').hasClass('no-csstransitions')) {
         stayintouchClose.addClass('is-scaled-up');
       }
       //stayintouch.addClass('animate-in');
       $('body').addClass('overflow-hidden');
     }, 200);
     setTimeout(function(){
       stayintouchClose.addClass('is-scaled-up');
     }, 1600);
   });

   // Stay-in-touch Form Close
   stayintouchClose.on('click', function(event) {
     event.preventDefault();
     stayintouch.addClass('animate-out');
     $('body').removeClass('overflow-hidden');
     setTimeout(function(){
       asideContent.removeClass('animate-out');
       stayintouch.removeClass('animate-in');
       stayintouchClose.removeClass('is-scaled-up');
     }, 300);
   });

   // Notify Form Open
   notifyTrigger.on('click', function(event){
     event.preventDefault();
     intro.addClass('is-scaled-down');
     $('body').addClass('overflow-hidden');
     setTimeout(function(){
       notify.addClass('is-visible');;
     }, 150);
     setTimeout(function(){
       notifyClose.addClass('is-scaled-up');
     }, 1400);
   });

   // Notify Form Close
   notifyClose.on('click', function(event){
     event.preventDefault();
     notify.removeClass('is-visible');
     setTimeout(function(){
       $('body').removeClass('overflow-hidden');
       intro.removeClass('is-scaled-down');
       notifyClose.removeClass('is-scaled-up');
     }, 150);
   });

   // Mobile Menu Open
   menuTrigger.on('click', function(event){
     event.preventDefault();
     $('body').addClass('overflow-hidden');
     $('#main').addClass('overflow-hidden');
     setTimeout(function(){
       menu.addClass('is-visible');;
     }, 150);
     setTimeout(function(){
       menuClose.addClass('is-scaled-up');
     }, 1400);
   });

   // Mobile Menu Close
   menuClose.on('click', function(event){
     event.preventDefault();
     menu.removeClass('is-visible');
     setTimeout(function(){
       $('body').removeClass('overflow-hidden');
       $('#main').removeClass('overflow-hidden');
       menuClose.removeClass('is-scaled-up');
     }, 150);
   });

   // Home Trigger Action
   homeTrigger.on('click', function(event){
     event.preventDefault();
     menu.removeClass('is-visible');
     setTimeout(function(){
       $('body').removeClass('overflow-hidden');
       $('#main').removeClass('overflow-hidden');
       menuClose.removeClass('is-scaled-up');
     }, 150);
   });

   // Sections Open/Close

   // Actions For Each Section
   $('.inner-trigger').on('click', function(event){
     intro.addClass('is-scaled-down');
     setTimeout(function(){
       menu.removeClass('is-visible');
       menuClose.removeClass('is-scaled-up');
     }, 800);
   });

   $('.inner-close').on('click', function(event){
     setTimeout(function(){
       intro.removeClass('is-scaled-down');
       $('body').removeClass('overflow-hidden');
       $('#main').removeClass('overflow-hidden');
     }, 200);
   });

   // About Section Open
   aboutTrigger.on('click', function(event){
     event.preventDefault();
     setTimeout(function(){
       aboutSection.addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
         aboutClose.addClass('is-scaled-up');
       });
       if($('html').hasClass('no-csstransitions')) {
         aboutClose.addClass('is-scaled-up');
       }
     }, 200);
   });

   // Works Section Open
   worksTrigger.on('click', function(event){
     event.preventDefault();
     setTimeout(function(){
       worksSection.addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
         worksClose.addClass('is-scaled-up');
       });
       if($('html').hasClass('no-csstransitions')) {
         worksClose.addClass('is-scaled-up');
       }
     }, 200);
   });

   // Contact Section Open
   contactTrigger.on('click', function(event){
     event.preventDefault();
     setTimeout(function(){
       contactSection.addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
         contactClose.addClass('is-scaled-up');
       });
       if($('html').hasClass('no-csstransitions')) {
         contactClose.addClass('is-scaled-up');
       }
     }, 200);
   });

   // About Section Close
   aboutClose.on('click', function(event) {
     event.preventDefault();
     aboutSection.removeClass('is-visible');
     setTimeout(function(){
       aboutClose.removeClass('is-scaled-up');
     }, 200);
   });

   // Works Section Close
   worksClose.on('click', function(event) {
     event.preventDefault();
     worksSection.removeClass('is-visible');
     setTimeout(function(){
       worksClose.removeClass('is-scaled-up');
     }, 200);
   });

   // Contact Section Close
   contactClose.on('click', function(event) {
     event.preventDefault();
     contactSection.removeClass('is-visible');
     setTimeout(function(){
       contactClose.removeClass('is-scaled-up');
     }, 200);
   });

 });
