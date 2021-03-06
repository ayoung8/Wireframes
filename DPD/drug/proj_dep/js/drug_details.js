//const drugCode = window.location.search.substr(3);
var _DRUG = window.DRUG; //get globals
var documentURL = _DRUG.END_POINT+ "dpd_json";
var monographURL = "https://rest-dev.hres.ca/rest-dev/product_monographs";



$(document).ready(function() {
    var drugCode=_getDrugCode();
    var fileSize="";
    const url = documentURL + "?select=*&drug_code=eq." + drugCode;

    $.get(url, function(data,status)  {

        var drug = data[0].drug_product;

        $("#product-title").html(drug.brand_name);

        var status = drug.status_detail[0];

        var statusDate =   DRUG.NOT_APPLICABLE;
        var marketDate =   DRUG.NOT_APPLICABLE;
        var product_status=drug.status_current;
       /* if(isFrench()){
            product_status=status.status_current_fr;
        }*/
        if (status.history_date) statusDate = makeDate(status.history_date);
        if (status.original_market_date) marketDate = makeDate(status.original_market_date);

        $("#status-product").html(product_status);
        $("#status-date").html(statusDate);
        $("#market").html(marketDate);
        $("#product").html(drug.brand_name);
        $("#din").html(drug.drug_identification_number);
        $("#company").html("<strong>" + drug.company.company_name + "</strong>");
        $("#active").html(drug.number_of_ais);

        if (drug.therapeutic_class) {
            $("#ahfs").html(drug.therapeutic_class[0].tc_ahfs_number + " " + drug.therapeutic_class[0].tc_ahfs);
            $("#atc").html(drug.therapeutic_class[0].tc_atc_number + " " + drug.therapeutic_class[0].tc_atc);
        }

        $("#aig").html(drug.ai_group_no);

        var body = "";

        if (document.documentElement.lang == "fr") { // FRENCH
            $("#company").append("<br>" + drug.company.street_name + "<br>" + drug.company.city_name + ", " + drug.company.province_f + "<br>" + drug.company.country_f + " " + drug.company.postal_code);
            $("#drug-class").html(drug.class_f);
            $("#dosage").html(drug.dosage_form_f.join(', '));
            $("#route").html(drug.route_f.join(', '));

            if (drug.schedule) $("#schedule").html(drug.schedule_f.join(', '));

            (drug.active_ingredients_detail).forEach(function(ing) {

                body += "<tr>" +
                    "<td>" + ing.ingredient_f + "</td>" +
                    "<td>" + ing.strength + " " + ing.strength_unit_f + "</td>" +
                    "</tr>";
            });

            $("#status").html("<strong>" + status.status_f + "</strong>");
        /*    $("#rmp").html("Un Plan de Gestion des Risques (PGR) pour ce produit " + (drug.risk_man_plan == "N" ? "n'a pas été" : "a été") + " soumis.");*/

            if (drug.product_monograph_fr_url) {
                $("#monograph").html("<a href='" + drug.product_monograph_fr_url + "' target='_blank'>Monographie électronique (" + makeDate(drug.pm_date) + ")</a>");
            }
            else {
                $("#monograph").html("Aucune monographie électronique disponible");
            }
        }
        else { // ENGLISH
            $("#company").append("<br>" + drug.company.street_name + "<br>" + drug.company.city_name + ", " + drug.company.province + "<br>" + drug.company.country + " " + drug.company.postal_code);
            $("#drug-class").html(drug.class);
            $("#dosage").html(drug.dosage_form.join(', '));
            $("#route").html(drug.route.join(', '));

            if (drug.schedule) $("#schedule").html(drug.schedule.join(', '));

            (drug.active_ingredients_detail).forEach(function(ing) {

                body += "<tr>" +
                    "<td>" + ing.ingredient + "</td>" +
                    "<td>" + ing.strength + " " + ing.strength_unit + "</td>" +
                    "</tr>";
            });

            $("#status").html("<strong>" + status.status + "</strong>");
           /* $("#rmp").html("A Risk Management Plan (RMP) for this product " + (drug.risk_man_plan == "N" ? "was not" : "was") + " submitted.");*/

            if (drug.product_monograph_en_url) {
                (setLink(drug.product_monograph_en_url,drug));
               // $("#monograph").html("<a href='" + drug.product_monograph_en_url + "' target='_blank'>Electronic Monograph (" + makeDate(drug.pm_date) +" PDF version 176 Kb "+")</a>");
            }
            else {
                $("#monograph").html("No Electronic Monograph Available");
            }
        }

        $("#ingredients-content").html(body);

        if (drug.vet_species) {
            for (var i = 0; i < drug.vet_species.length; i++) {
                if (i == 0) {
                    $("#species").html(drug.vet_species[i]);
                }
                else {
                    $("#species").append(", " + drug.vet_species[i]);
                }
            }

            $("#species-div").css("display", "block");
        }

        $("#api-call").attr("href", url).attr("target", "_blank").html(url);
        $("#refresh").text(makeDate(drug.last_refresh));
    });
});

function makeDate(iso) {

    const d = new Date(iso);
    const month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
    const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();

    return d.getFullYear() + "-" + month + "-" + day;
}
function _getDrugCode() {
    //whole string without the question mark
    var query = window.location.search.substr(1);
    //a) find the previous results
    var prevIndex = query.indexOf("&"+DRUG.PREV_QUERY_EQUAL);
    if(prevIndex<0){
        //error case
        return query.substr(DRUG.QUERY_EQUAL.length);
    }
    return query.substring(DRUG.QUERY_EQUAL.length, prevIndex);
}

/**
 * Gets the previous search query terms. Drops the parameter
 * @returns {string}
 * @private
 */
function _getPrevQuery(){
    var query = window.location.search.substr(1);
    var search="&"+DRUG.PREV_QUERY_EQUAL;
    //a) find the previous results
    var prevIndex = query.indexOf(search);
    if(prevIndex>-1) {
        return (query.substr(prevIndex+search.length));
    }
        return "";
    }

/**
 * creates the url and executes it for returning to the results page
 */
function returnToResults() {
    window.location.href = _DRUG.RESULTS_PAGE_NAME + "?"+DRUG.QUERY_EQUAL+ _getPrevQuery();
}

function get_filesize(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true); // Notice "HEAD" instead of "GET",
                                 //  to get only the header
    xhr.onreadystatechange = function() {
        if (this.readyState == this.DONE) {

            //var headers = xhr.getAllResponseHeaders();
            callback(parseInt(xhr.getResponseHeader("Content-Length")));
        }
    };
    xhr.send();
}
function getFileBytes(url,fileSize) {

   fileSize= get_filesize(url, function(size) {
       return size;
       //console.log(fileSize);
    });
    console.log(fileSize);

}


async function temp() {
    let foo="";
    foo= await get_filesize("https://pdf.hres.ca/dpd_pm/00049126.PDF", function(size) {
           //alert("The size of foo.exe is: " + size + " bytes.");
          return size
       });
     return foo

}
async  function setLink(url,drug) {
    //to do french
    await getFileSize(url).then(function(response) {
        let size=(bytesToSize(response));
        $("#monograph").html("<a href='" + drug.product_monograph_en_url + "' target='_blank'>Electronic Monograph (" + makeDate(drug.pm_date) +" PDF version "+size+")</a>");
        return size;
    }, function(error) {
        //return(0);
        console.warn(error);
    });
}


    function getFileSize(url) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('HEAD', url, true)
        request.onreadystatechange = () => {
            if (request.readyState >= 2) {
                resolve(request.getResponseHeader("Content-Length"));
                request.abort()
            }
        }

        request.onerror = (e) => {
            reject(e)
        }

        request.send()
    })
}




  function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)*100))/100+ ' ' + sizes[i];
}