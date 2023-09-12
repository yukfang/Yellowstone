const TABLES =  require('./database/table')

const raw_tickets = 
`
1284648
1284715
1285981
1304581
1384048
1134418
1268272
1276620
1277467
1277857
1385123
1323763
1292779
1274560
1280880
1092474
1200069
1241830
1277385
1399634
1014839
1058615
1130495
1289539
1301691
1248243
1259695
1267889
1258299
1361292
1367843
1227532
1233847
1301047
1128958
1130482
1187870
1261329
1280051
1298049
1279899
1008511
1050040
1087229
1101424
1105692
1111137
1120650
1128483
1131759
1140382
1140650
1143346
1144990
1156816
1161830
1164390
1166286
1167108
1168027
1171894
1172591
1176456
1177172
1178631
1183107
1184057
1188173
1191598
1192689
1203539
1205211
1205806
1205841
1205877
1208084
1208572
1214680
1216432
1217381
1218922
1220575
1221255
1222602
1223571
1223701
1232901
1234032
1234952
1234956
1238180
1244186
1244263
1246426
1256818
1264513
1265317
1267397
1268720
1276590
1277678
1277893
1278248
1278654
1281066
1284658
1292012
1386643
1399405
1413398
1414686
1424722
1425585
1428507
1431360
1431383
1431394
1241385
1244691
1241673
1247874
1396791
1403180
1343658
1394275
1366868
1395145
1299096
1393578
1399596
1118371
1158226
1208036
1210388
1218060
1056512
1059180
1115874
1120427
1120800
1130131
1273823
1145054
1153290
1158491
1159799
1180765
1196697
1196877
1200936
1211336
1214496
1217963
1220048
1225017
1350580
1350583
1297092
1297229
1297237
1305565
1311091
1311204
1317718
1317724
1317726
1317733
1317735
1317772
1317776
1317800
1317806
1317808
1317816
1317821
1317826
1317870
1317874
1317877
1317884
1323090
1323862
1114212
1132599
1202069
1242406
1245873
1290973
1292567
1296462
1299564
1336404
1379830
1420026
1325999
1326006
1326311
1326590
1326678
1326694
1326703
1326706
1326723
1326725
1326730
1326747
1326759
1326821
1326826
1326829
1326834
1326838
1326840
1326850
1326852
1291930
1292113
1292572
1292579
1292694
1295148
1295253
1328782
1328800
1350576
1350578
1350588
1350590
1350595
1363739
1365176
1365435
1370980
1370990
1370992
1371076
1371293
1371331
1371461
1380005
1380011
1380036
1386214
1411995
1428494
1323672
982218
1078529
1293821
1296459
1260818
1266771
1049509
1155024
1227429
1233588
1237938
1253341
1264565
1279711
1280782
1078594
1090608
1153579
1284394
1290580
1298719
1357336
1202943
1265238
1300770
1260774
1253930
1259288
1409149
1275915
1235364
1120420
1233663
1293358
1208719
1130491
1242991
1296465
1305874
1367851
1373029
1409286
1164059
1179266
1202104
1281541
1283890
1289056
1289377
1292695
1294163
1296368
1296969
1297100
1346969
1347648
1289062
1295703
1296807
1411638
1437299
993708
995342
995527
1003323
1007496
1019081
1033347
1034825
1035432
1054623
1055449
1058941
1061948
1063348
1071496
1071591
1072991
1075052
1085909
1086625
1088585
1090669
1092089
1117893
1120671
1126370
1127785
1130475
1146281
1167343
1171963
1196999
1206910
1211511
1217292
1218457
1219439
1223360
1224574
1227701
1230817
1231277
1235288
1236327
1248200
1253183
1261199
1267424
1281945
1282348
1285928
1294248
1295262
1296471
1298193
1298588
1298644
1298851
1299010
1299278
1299298
1299919
1301270
1301403
1301760
1325991
1333997
1349010
1351310
1364973
1367861
1367869
1378602
1382120
1385233
1408777
1411057
1414944
1423747
1326145
1377962
1274175
1236169
992301
1104998
1168094
1227635
1237458
1246959
1258167
1244455
1246025
1196981
1066150
1139686
1298120
1143376
1196518
1207231
1214863
1311024
1313321
1313509
1328602
1404264
1237969
1248508
1250994
1261434
1276206
1276615
1279882
1282028
1394822
1419184
1419186
1440359
1447886
1308439
1323553
1341020
1347329
1363103
1424192
1431374
1437571
1439517
1442251
1305271
1309336
1312052
1305757
1306349
1306409
1306787
1307264
1308704
1308937
1309266
1309325
1309784
1311334
1311548
1311644
1311646
1311692
1312064
1312353
1312995
1313013
1311607
1314159
1314491
1314578
1314867
1315005
1315390
1315893
1315895
1316290
1317059
1317851
1318174
1318303
1318547
1318867
1319308
1319332
1323746
1323776
1323788
1325989
1326305
1326331
1326710
1327991
1333153
1333910
1336386
1336392
1341755
1348365
1350444
1351028
1351563
1359581
1359657
1363156
1368151
1368656
1371491
1383553
1388859
1393284
1394156
1396795
1401591
1404150
1404194
1437446
1409630
1444807
1449036
1445281
1445110
1443160
1442095
1440065
1440058
1440039
1438424
1412028
1415165
1424561
1409307
1424571
1424931
1424907
1417895
1409663
1341804
1202254
1266176
1314940
1380463
1126866
1242235
1325980
1326688
1326009
1328800
1326838
1326840
1326710
1326297
1326821
1331032
1326759
1322833
1325989
1326293
1326730
1326145
1326747
1326852
1326706
1326063
1329704
1330326
1324459
1326855
1327991
1327364
1329107
1329841
1323250
1324457
1322748
1324469
1323915
1324424
1323928
1323788
1436951
1394409
1461150
1299913
1292733
1350588
1428339
1380040
1380023
1380051
1326009
1325975
1325977
1325980
1325939
1325956
1305578
1325930
1454937
1458605
1365417
1295031
1323659
1453358
1292078
1365426
1326744
1311150
1455097
1393919
1383796
1445229
1380007
1325994
1325933
1326013
1370994
1242235
1314940
1380463
1126866
1437446
1317745
1388859
1370986
1325358
1331495
1324651
1331136
1328320
1330844
1331241
1328673
1330848
1327924
1327751
1324545
1327723
1411978
1300009
1300605
1402937
1387070
1316035
1329879
1295320
1312061
1312098
1311108
1328337
1415567
1317741
1326614
1326331
1325999
1323862
1323776
1295286
1249377
1367859
1326834
1326850
1317866
1326725
1292097
1326723
1317779
1332440
1428146
1332357
1396894
1326293
1322833
1326013
1325933
1326297
1325939
1323659
1326009
1325956
1325930
1325975
1326744
1326614
1325994
1325977
1325980
1393569
1362497
1381641
1362425
1353355
1364107
1362446
1362450
1394256
1387773
1362478
1396116
1394229
1411586
1333879
1416597
1311118
1326684
1291914
1292104
1292148
1417107
1292745
1370037
1311188
1313928
1403770
1386222
1411976
1295129
1295133
1364609
1311100
1292760
1386244
1401130
1361589
1388551
1325969
1311159
1325957
1325998
1297228
1325995
1328776
1325970
1325973
1326152
1311597
1326137
1323694
1326328
1305703
1292091
1323715
1292717
1295232
1292691
1292727
1323847
1311137
1311132
1386219
1311048
1311173
1331530
1295354
1292157
1295164
1292151
1292100
1219767
1278868
1205299
971029
1017056
984244
1094002
1157419
1258270
1133635
1265927
1296357
1188290
1202875
1259986
1139562
1087057
1064527
1126749
1102508
1134527
1156070
1094369
1203921
1115713
1115058
1078588
1132175
1143591
1044326
1161273
1046839
1203082
1130702
1076252
1106860
1205893
1224284
1114051
1115275
1120739
1129334
1130466
1131820
1153498
1143284
1155825
1158544
1049511
1074035
1094576
1161264
1143590
1166201
1168939
1169024
1177341
1177748
1178102
1180905
1188519
1189084
1194475
1195091
1194771
1197073
1201188
1203501
1205660
1204179
1206467
1209134
1211475
1210535
1215198
1214637
1215241
1216148
1218503
1217893
1216960
1220507
1230106
1291255
1257895
1209898
1203090
940310
1273674
1276110
1055479
1216675
1243464
1207400
1122825
1247379
1246164
1265806
1092426
1215424
1068304
1073643
1199982
1117273
1168861
1277940
1283949
1284383
1225129
1167817
1218710
1089663
1146081
1250315
1172998
1296826
1233330
1251336
1249988
1299217
1168917
1231055
1251348
1046376
1092658
1233061
1025329
1258547
1246038
1254037
1259396
1259429
1264605
1274796
1278020
1283375
1277496
1265607
1278117
1266637
1282963
1283051
1282982


`

const tickets =  raw_tickets.trim().split(`\n`).map(t=>parseInt(t.trim()))
// console.log(tickets.length)


async function preProcessTicket() {
    const OrderTable = await TABLES.OrderInfo2
    const orders = (await OrderTable.findAll({
        attributes: ['order_id']
    }))?.map(o => o.dataValues).map(o => o.order_id)

    console.log(orders)

    const new_tickets = tickets.filter(t => !(orders.includes(t)))

    if(new_tickets.length === 0) {
        console.log(`No new tickets found!`)
    } else{
        console.log(new_tickets)
    }

    await OrderTable.bulkCreate(new_tickets.map(t => {
        return {
            order_id    : t,
            refreshAt   : '2020-10-23T08:08:08Z',
            update_time : '2020-10-23T08:08:08Z',
            summary     : {id: t}
        }
    }))
}

// preProcessTicket();