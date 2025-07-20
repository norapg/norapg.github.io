// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">Contents</a></li><li class="chapter-item expanded affix "><a href="Foreword.html">Foreword</a></li><li class="chapter-item expanded affix "><a href="Preface2.html">Preface to the Second Edition</a></li><li class="chapter-item expanded affix "><a href="Preface1.html">Preface to the First Edition</a></li><li class="chapter-item expanded affix "><a href="Acknowledgments.html">Acknowledgments</a></li><li class="chapter-item expanded affix "><a href="References.html">References</a></li><li class="chapter-item expanded affix "><a href="List_of_Exercises.html">List of Exercises</a></li><li class="chapter-item expanded affix "><a href="Index.html">Index</a></li><li class="chapter-item expanded "><a href="1.html"><strong aria-hidden="true">1.</strong> Building Abstractions with Procedures</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="1.1.html"><strong aria-hidden="true">1.1.</strong> The Elements of Programming</a></li><li class="chapter-item expanded "><a href="1.2.html"><strong aria-hidden="true">1.2.</strong> Procedures and the Processes They Generate</a></li><li class="chapter-item expanded "><a href="1.3.html"><strong aria-hidden="true">1.3.</strong> Formulating Abstractions with Higher-Order Procedures</a></li></ol></li><li class="chapter-item expanded "><a href="2.html"><strong aria-hidden="true">2.</strong> Building Abstractions with Data</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="2.1.html"><strong aria-hidden="true">2.1.</strong> Introduction to Data Abstraction</a></li><li class="chapter-item expanded "><a href="2.2.html"><strong aria-hidden="true">2.2.</strong> Hierarchical Data and the Closure Property</a></li><li class="chapter-item expanded "><a href="2.3.html"><strong aria-hidden="true">2.3.</strong> Symbolic Data</a></li><li class="chapter-item expanded "><a href="2.4.html"><strong aria-hidden="true">2.4.</strong> Multiple Representations for Abstract Data</a></li><li class="chapter-item expanded "><a href="2.5.html"><strong aria-hidden="true">2.5.</strong> Systems with Generic Operations</a></li></ol></li><li class="chapter-item expanded "><a href="3.html"><strong aria-hidden="true">3.</strong> Modularity, Objects, and State</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="3.1.html"><strong aria-hidden="true">3.1.</strong> Assignment and Local State</a></li><li class="chapter-item expanded "><a href="3.2.html"><strong aria-hidden="true">3.2.</strong> The Environment Model of Evaluation</a></li><li class="chapter-item expanded "><a href="3.3.html"><strong aria-hidden="true">3.3.</strong> Modeling with Mutable Data</a></li><li class="chapter-item expanded "><a href="3.4.html"><strong aria-hidden="true">3.4.</strong> Concurrency: Time Is of the Essence</a></li><li class="chapter-item expanded "><a href="3.5.html"><strong aria-hidden="true">3.5.</strong> Streams</a></li></ol></li><li class="chapter-item expanded "><a href="4.html"><strong aria-hidden="true">4.</strong> Metalinguistic Abstraction</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="4.1.html"><strong aria-hidden="true">4.1.</strong> The Metacircular Evaluator</a></li><li class="chapter-item expanded "><a href="4.2.html"><strong aria-hidden="true">4.2.</strong> Variations on a Scheme -- Lazy Evaluation</a></li><li class="chapter-item expanded "><a href="4.3.html"><strong aria-hidden="true">4.3.</strong> Variations on a Scheme -- Nondeterministic Computing</a></li><li class="chapter-item expanded "><a href="4.4.html"><strong aria-hidden="true">4.4.</strong> Logic Programming</a></li></ol></li><li class="chapter-item expanded "><a href="5.html"><strong aria-hidden="true">5.</strong> Computing with Register Machines</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="5.1.html"><strong aria-hidden="true">5.1.</strong> Designing Register Machines</a></li><li class="chapter-item expanded "><a href="5.2.html"><strong aria-hidden="true">5.2.</strong> A Register-Machine Simulator</a></li><li class="chapter-item expanded "><a href="5.3.html"><strong aria-hidden="true">5.3.</strong> Storage Allocation and Garbage Collection</a></li><li class="chapter-item expanded "><a href="5.4.html"><strong aria-hidden="true">5.4.</strong> The Explicit-Control Evaluator</a></li><li class="chapter-item expanded "><a href="5.5.html"><strong aria-hidden="true">5.5.</strong> Compilation</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
