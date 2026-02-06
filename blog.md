---
layout: default
title: Blog
permalink: /blog/
---

# Blog

Thoughts on technology, leadership, security, and occasionally life.

---

{% for post in site.posts %}
### [{{ post.title }}]({{ post.url }})
<small>{{ post.date | date: "%B %d, %Y" }}</small>

{{ post.excerpt }}

---
{% endfor %}

{% if site.posts.size == 0 %}
*Nothing here yet. Check back soon!*
{% endif %}
