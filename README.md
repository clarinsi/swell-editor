# A fork of [swell-editor](https://github.com/spraakbanken/swell-editor)

## Description
Swell and Svala are state-of-the-art tools for the creation of language resources that include language modifications. Svala ([Wirén 2019](https://www.diva-portal.org/smash/get/diva2:1332091/FULLTEXT01.pdf)) is a tool for user-friendly pseudonymising, normalising (correcting), and marking language corrections in learners' texts. It is part of the platform SweLL ([Volodina et al. 2019](https://nejlt.ep.liu.se/article/view/1374)), which also allows the management of workflows for text collection and annotation. The openly available tools that were originally developed for teaching Swedish as L2, were localised and adapted for Slovene as part of the national project [Development of Slovene in a Digital Environment](https://rsdo.slovenscina.eu/en). We decided to prioritise the transfer of the modules that enables transcription, simple anonymisation and annotation of language corrections, leaving the more advanced features aside. The current adaptation serves the upgrading of two corpora for Slovene: Šolar, the developmental corpus of Slovene as L1 ([Arhar Holdt et al. 2022](https://www.clarin.si/repository/xmlui/handle/11356/1589)), and KOST, the learner corpus of Slovene as L2 ([Stritar Kučuk 2022](https://centerslo.si/wp-content/uploads/2022/11/Stritar-Kucuk_Obdobja-41.pdf)). The adapted program is available at [https://orodja.cjvt.si/svala](https://orodja.cjvt.si/svala).

## Differences to original [swell-editor](https://github.com/spraakbanken/swell-editor)

The differences of this fork to the original are:
* Added multilinguality: The program now has the option to support multiple languages. We added Slovenian translations, but other languages could now be easily introduced by writing `translation.json` file for desired language.
* Expanded grouping to error tags: We expanded option to group error tags together to up to two levels. For example, we now may have group of "Syntax" that has subgroup "Redundant linguistic elements" with error tag "Adverb". We also added option to toggle groups and subgroups.
* Adapted taxonomy: We created two new sets of error annotations. One for developmental corpus of Slovene as L1 (Šolar) and other for the learner corpus of Slovene (KOST)
* Added file saving: We transitioned from backend connections to a server to saving and loading using file system.
* Other smaller modifications, e.g. we re-arranged the "show options" dropdown and enabled the possibility that the error tags are presented in the taxonomy with more intuitive names for better user-friendliness.

## Setup
### Running the tool

```
yarn
yarn run serve
```

### Testing

```
yarn run test
```

End to end:

```
yarn run serve # start server on port 1234
yarn run test:e2e
```

Coverage:

```
yarn run coverage
```

While developing:

```
yarn run doctest:watch
```

### Deployment

_SB-specific_:

```
yarn run deploy
```

### Docker
Build an image:
```
docker build github.com/clarinsi/swell-editor -t swell-editor-image
```

Run image:
```
docker run --name swell-container -d -p 3456:80 swell-editor-image
```

### Updating the taxonomy

Taxonomy may be updated in `src/Editor/Config.ts` and then deployed (see above).