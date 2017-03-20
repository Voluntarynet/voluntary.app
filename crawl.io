// on OSX, need to run "export EVENT_NOKQUEUE=1" in shell first to avoid OSX kqueue bug
/*
==> list(attributes, setParent, elementsWithNameAndId, name, subitems, asObject, allText, endTag, init, withText, type, tableData, beginTag, linkStrings, elementsWithNameAndClass, text, writeToStream, firstText, asString, attribute, parent, setName, setText, search, setAttributes, elementsWithNameAndClasses, redirectStrings, elementWithName, elementsWithName, setSubitems)
*/

SGML

SGMLElement previous := method(
    subitems := parent subitems
    subitems at(subitems indexOf(self) - 1)
)

SGMLElement next := method(
    subitems := parent subitems
    index := subitems indexOf(self)
    writeln("subitems indexOf(self) = ", index, " ", subitems size)
    item := subitems at(index + 2)
    writeln("item = ", item)
    item
)

SGMLElement nextElementWithName := method(name,
    subitems := parent subitems
    index := subitems indexOf(self)
    for(i, index + 1, subitems size - 1,
        item := subitems at(i)
        if(item name == name, return item)
    )
    nil
)

CraigslistCrawler := Object clone do(
    init := method(
    
    )

    findRegions := method(
        s := URL with("http://www.craigslist.org/about/sites") fetch asXML

        states := s elementsWithName("h4")

        countryName := "US"

        region := Map clone atPut("_type", "Region") 

        countryDict := region clone atPut("name", "US")

        stateDictList := List clone

        states foreach(state, 
            stateDict := region clone atPut("name", state firstText ) 
    
            cities := state nextElementWithName("ul") elementsWithName("a") 
            cityDicts := List clone
            cities foreach(city,
                cityDict := region clone atPut("name", city firstText )
                cityDicts append(cityDict)
            )
    
            stateDict atPut("children", cityDicts)
            stateDictList append(stateDict)
        )
    
        countryDict atPut("children", stateDictList)
        countryDict asJson println
    )
)

CraigslistCrawler clone findRegions

System exit
