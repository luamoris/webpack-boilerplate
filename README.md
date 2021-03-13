[![Logo Template][logo]][github]

# Prerequisites 
> #### Node.js (^10.12.0, or >=12.0.0)

---

## Get started

```
	git clone https://github.com/luamoris/template.git
	cd template
	npm i
	npm start
```

---

## For build

```
	npm run dev 	// development
	npm run build	// production
```

---

## For stats

```
	npm run stats	// create stats.json
```

---

## For Lint

- [stylelint][stylelint]
- [eslint][eslint]

```
	npm run lint		// lint Javascript files
	npm run stylelint	// lint SCSS files
```

---

# Additionally for the VS Code

### Extensions 
__`settings.json`__

> - #### ESLint

> - #### stylelint
```
	"stylelint.ignoreDisables": true,
```

> - #### Live Sass Compiler
```
	"liveSassCompile.settings.generateMap": false,
	"liveSassCompile.settings.formats": [
		{
			"format": "expanded",
			"extensionName": ".css",
			"savePath": "./src/css"
		}
	],
	"liveSassCompile.settings.autoprefix": [
		"> 1%",
		"last 5 versions"
	]
```

--- 

[stylelint]: https://stylelint.io/
[eslint]: https://eslint.org/

[logo]: https://raw.githubusercontent.com/luamoris/template/634e93615165ca5dcbc2fc80a3562b116e01262f/src/img/box.svg
[github]: https://github.com/luamoris/template