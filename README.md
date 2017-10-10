## Smarter Crowdsourcing (Zika, Cotopaxi, Anti-Corruption)

### Installation
    bundle install
    npm install
    bundle exec jekyll build


### Development
Run the server with `gulp` at [http://localhost:3000/](http://localhost:3000/) or `bundle exec jekyll serve` at [http://localhost:4000/](http://localhost:4000/).


### Translations
The [jekyll-multiple-languages-plugin](https://github.com/Anthony-Gaudino/jekyll-multiple-languages-plugin) is used to set languages in `_config.yml`.

The first item indicated in the `languages` array will determine which `yaml` file in the `_i18n` folder will be used to load the page.


### Page Generation
The [jekyll-datapage-gen](https://github.com/avillafiorita/jekyll-datapage_gen) plugin creates a page for each topic and topic conference using the `topics-template.html` and `topics.yaml`.


### Data
The Contentful API data is fetched and stored in `solutions.yaml` file within the `_data` folder.

Pull Contentful data with `bundle exec jekyll contentful`


### Deployment
Run `gulp deploy` to deploy to GitHub Pages.
