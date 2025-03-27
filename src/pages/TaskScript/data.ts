import type { TPostTaskStartRequest } from '@/apis/task/types';
import { PresetColors } from 'antd/es/theme/internal';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { Key } from 'react';

// 创建任务脚本 modal
// 新设置参数
const PresetPorts = {
    all: '1-65535',
    top100: '7,5555,9,13,21,22,23,25,26,37,53,79,80,81,88,106,110,111,113,119,135,139,143,144,179,199,389,427,443,444,445,465,513,514,515,543,544,548,554,587,631,646,873,888,990,993,995,1025,1026,1027,1028,1029,1080,1110,1433,1443,1720,1723,1755,1900,2000,2001,2049,2121,2181,2717,3000,3128,3306,3389,3986,4899,5000,5009,5051,5060,5101,5190,5357,5432,5631,5666,5800,5900,6000,6001,6646,7000,7001,7002,7003,7004,7005,7070,8000,8008,8009,8080,8081,8443,8888,9100,9999,10000,11211,32768,49152,49153,49154,49155,49156,49157,8088,9090,8090,8001,82,9080,8082,8089,9000,8002,89,8083,8200,90,8086,801,8011,8085,9001,9200,8100,8012,85,8084,8070,8091,8003,99,7777,8010,8028,8087,83,808,38888,8181,800,18080,8099,8899,86,8360,8300,8800,8180,3505,9002,8053,1000,7080,8989,28017,9060,8006,41516,880,8484,6677,8016,84,7200,9085,5555,8280,1980,8161,9091,7890,8060,6080,8880,8020,889,8881,9081,7007,8004,38501,1010,17,19,255,1024,1030,1041,1048,1049,1053,1054,1056,1064,1065,1801,2103,2107,2967,3001,3703,5001,5050,6004,8031,10010,10250,10255,6888,87,91,92,98,1081,1082,1118,1888,2008,2020,2100,2375,3008,6648,6868,7008,7071,7074,7078,7088,7680,7687,7688,8018,8030,8038,8042,8044,8046,8048,8069,8092,8093,8094,8095,8096,8097,8098,8101,8108,8118,8172,8222,8244,8258,8288,8448,8834,8838,8848,8858,8868,8879,8983,9008,9010,9043,9082,9083,9084,9086,9087,9088,9089,9092,9093,9094,9095,9096,9097,9098,9099,9443,9448,9800,9981,9986,9988,9998,10001,10002,10004,10008,12018,12443,14000,16080,18000,18001,18002,18004,18008,18082,18088,18090,18098,19001,20000,20720,21000,21501,21502,28018',
    topweb: '443,80,8080-8083,8088,1070,1080,1090,888,777,999,8000-8003,8008,7000-7003,9000-9002,8090,9200,9300',
    'top1000+':
        '7,5555,9,13,21,22,23,25,26,37,53,79,80,81,88,106,110,111,113,119,135,139,143,144,179,199,389,427,443,444,445,465,513,514,515,543,544,548,554,587,631,646,873,888,990,993,995,1025,1026,1027,1028,1029,1080,1110,1433,1443,1720,1723,1755,1900,2000,2001,2049,2121,2181,2717,3000,3128,3306,3389,3986,4899,5000,5009,5051,5060,5101,5190,5357,5432,5631,5666,5800,5900,6000,6001,6646,7000,7001,7002,7003,7004,7005,7070,8000,8008,8009,8080,8081,8443,8888,9100,9999,10000,11211,32768,49152,49153,49154,49155,49156,49157,8088,9090,8090,8001,82,9080,8082,8089,9000,8002,89,8083,8200,90,8086,801,8011,8085,9001,9200,8100,8012,85,8084,8070,8091,8003,99,7777,8010,8028,8087,83,808,38888,8181,800,18080,8099,8899,86,8360,8300,8800,8180,3505,9002,8053,1000,7080,8989,28017,9060,8006,41516,880,8484,6677,8016,84,7200,9085,5555,8280,1980,8161,9091,7890,8060,6080,8880,8020,889,8881,9081,7007,8004,38501,1010,17,19,255,1024,1030,1041,1048,1049,1053,1054,1056,1064,1065,1801,2103,2107,2967,3001,3703,5001,5050,6004,8031,10010,10250,10255,6888,87,91,92,98,1081,1082,1118,1888,2008,2020,2100,2375,3008,6648,6868,7008,7071,7074,7078,7088,7680,7687,7688,8018,8030,8038,8042,8044,8046,8048,8069,8092,8093,8094,8095,8096,8097,8098,8101,8108,8118,8172,8222,8244,8258,8288,8448,8834,8838,8848,8858,8868,8879,8983,9008,9010,9043,9082,9083,9084,9086,9087,9088,9089,9092,9093,9094,9095,9096,9097,9098,9099,9443,9448,9800,9981,9986,9988,9998,10001,10002,10004,10008,12018,12443,14000,16080,18000,18001,18002,18004,18008,18082,18088,18090,18098,19001,20000,20720,21000,21501,21502,28018,93,6666,7010,100,9003,6789,7060,8022,4848,3050,8787,8013,8040,10021,2011,6006,4000,8055,4430,6060,7788,8066,9898,8801,10040,7006,803,6688,10080,8050,7011,7009,40310,802,10003,8014,2080,7288,9992,8005,8889,5644,8886,9500,58031,50000,9020,8015,50060,8887,8021,8700,9900,9191,3312,8186,8735,8380,1234,38080,2110,8007,21245,3333,2046,9061,8686,9011,8061,9876,8282,60465,2222,9009,1100,18081,70,8383,5155,8188,2517,50070,8062,11324,9231,999,28214,8987,809,2010,7700,3535,7921,11080,6778,805,8073,114,2012,701,8810,8400,9007,8808,8065,8822,15000,9901,11158,1107,28099,12345,2006,9527,51106,688,25006,8045,9006,8023,8029,9997,7048,8580,8585,8035,10088,20022,4001,9005,2013,20808,3580,7742,8119,32766,50075,7272,3380,3220,7801,5256,5255,10086,1300,5200,6198,1158,6889,3503,6088,9991,806,8183,8688,1001,58080,1182,9025,8112,7776,7321,235,8077,8500,11347,7081,8877,8480,9182,58000,8026,11001,10089,5888,8196,8078,9995,2014,5656,8019,5003,8481,6002,9889,9015,8866,8182,8057,8399,8308,511,12881,4016,1039,28080,5678,7500,8051,18801,15018,15888,38443,8123,9004,8144,94,9070,1800,9112,8990,3456,2051,9131,97,7100,7711,7180,11000,8037,6988,122,8885,14007,8184,7012,8079,9888,9301,59999,49705,1979,8900,5080,5013,1550,8844,4850,206,5156,8813,3030,1790,8802,9012,5544,3721,8980,10009,8043,8390,7943,8381,8056,7111,1500,5881,9437,5655,8102,65486,4443,3690,10025,8024,8333,8666,103,8,9666,8999,9111,8071,522,11381,20806,8041,1085,8864,7900,1700,8036,8032,8033,8111,60022,955,3080,8788,27017,7443,8192,6969,9909,5002,9990,188,8910,9022,50030,866,8582,4300,9101,6879,8891,4567,4440,10051,10068,50080,8341,30001,6890,8168,8955,16788,8190,18060,6379,7041,42424,15693,2521,19010,18103,6010,8898,9910,9190,8260,8445,1680,8890,8649,30082,3013,30000,2480,7202,9704,5233,8991,11366,7888,8780,7129,6600,47088,7791,18888,50045,15672,2585,60,9494,31945,2060,8610,8860,58060,6118,2348,38000,18880,13382,6611,8064,7101,5081,7380,7942,10016,8027,2093,403,9014,8133,6886,95,8058,9201,6443,5966,27000,7017,6680,8401,9036,8988,8806,6180,421,423,57880,7778,18881,812,15004,9110,8213,9300,1213,8193,8956,1108,778,65000,7020,1122,9031,17000,8039,8600,50090,1863,8191,65,6587,8136,9507,132,200,2070,308,5811,3465,8680,7999,7084,3938,5902,9595,442,4433,7171,7567,811,1128,6003,2125,6090,10007,7022,1949,6565,65001,1301,19244,10087,8025,5098,21080,1200,15801,1005,22343,7086,8601,6259,7102,10333,211,10082,18085,180,40000,7021,7702,66,38086,666,6603,1212,65493,96,9053,7031,23454,30088,6226,8660,6170,8972,48080,10118,40069,28780,20153,20021,20151,58898,10066,1818,9914,55351,8343,6546,3880,8902,22222,19045,5561,7979,5203,50240,49960,2007,1722,8913,8912,9504,8103,8567,1666,8720,8197,3012,8220,9039,5898,925,38517,8382,6842,8895,2808,447,3600,3606,45177,19101,171,133,8189,7108,10154,47078,6800,8122,381,15580,23352,3443,1180,268,2382,43651,10099,65533,7018,60010,60101,6699,2005,2009,59777,591,1933,9013,8477,9696,9030,2015,7925,6510,18803,280,5601,2901,2301,5201,302,610,5552,8809,6869,9212,17095,20001,8781,25024,5280,7909,17003,1088,7117,20052,10038,30551,9980,9180,59009,28280,7028,61999,7915,8384,9918,9919,55858,7215,77,9845,20140,7856,1982,1123,17777,8839,208,2886,877,6101,5100,804,983,5600,8402,5887,8322,5632,770,13333,7330,3216,31188,47583,8710,22580,1042,34440,20,7703,65055,8997,6543,6388,8283,7201,4040,61081,12001,3588,7123,2490,4389,1313,19080,9050,6920,299,20046,8892,9302,7899,30058,7094,6801,321,1356,12333,11362,11372,6602,7709,45149,3668,517,9912,8130,7050,7713,40080,8104,13988,18264,8799,7072,55070,23458,8176,9517,9541,9542,9512,8905,11660,44445,44401,17173,436,560,733,968,602,3133,3398,16580,8488,8901,8512,10443,9113,9119,6606,22080,5560,5757,1600,8250,10024,10200,333,73,7547,8054,6372,223,3737,9019,8067,45692,15400,15698,9038,37006,2086,1002,9188,8201,8202,30030,2663,9105,10017,4503,1104,8893,40001,27779,3010,7083,5010,5501,309,1389,10070,10069,10056,3094,10057,10078,10050,10060,10098,4180,10777,270,6365,9801,1046,7140,1004,9198,8465,8548,108,30015,8153,1020,50100,8391,34899,7090,6100,8777,8298,8281,7023,3377,8499,7501,4321,3437,9977,14338,843,7901,6020,6011,1988,4023,20202,20200,7995,18181,9836,586,2340,8110,9192,2525,6887,4005,8992,11212,2168,60080,6664,10005,956,1016,4453,8974,10101,58124,30025,7789,7280,8068,11180,1984,5566,916,8828,17071,15080,8820,104,21900,5151,860,6286,5118,18765,7055,9989,807,7751,8684,1999,9333,55352,8681,19994,3033,8017,7093,7896,4242,58083,56688,6167,9922,3618,7082,1603,16929,198,8075,7044,8232,12315,4570,4569,31082,8861,3680,4455,8403,4497,4380,7273,8896,21188,22480,1445,20165,20142,9068,1083,59093,41474,9224,9718,23380,5225,18889,4237,30,14549,8052,911,19000,7799,7300,9168,29798,4480,22228,7903,810,68,31000,9103,20992,8049,2261,8105,10152,5780,10111,3003,1,3,4,6,24,32,33,42,43,49,109,125,146,161,163,212,222,254,256,259,264,301,306,311,340,366,406,407,416,417,425,458,464,481,497,500,512,524,541,545,555,563,593,616,617,625,636,648,667,668,683,687,691,700,705,711,714,720,722,726,749,765,777,783,787,898,900,901,902,903,912,981,987,992,1007,1009,1011,1021,1022,1023,1031,1032,1033,1034,1035,1036,1037,1038,1040,1043,1044,1045,1047,1050,1051,1052,1055,1057,1058,1059,1060,1061,1062,1063,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1084,1086,1087,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1102,1105,1106,1111,1112,1113,1114,1117,1119,1121,1124,1126,1130,1131,1132,1137,1138,1141,1145,1147,1148,1149,1151,1152,1154,1163,1164,1165,1166,1169,1174,1175,1183,1185,1186,1187,1192,1198,1199,1201,1216,1217,1218,1233,1236,1244,1247,1248,1259,1271,1272,1277,1287,1296,1309,1310,1311,1322,1328,1334,1352,1417,1434,1455,1461,1494,1501,1503,1521,1524,1533,1556,1580,1583,1594,1641,1658,1687,1688,1717,1718,1719,1721,1761,1782,1783,1805,1812,1839,1840,1862,1864,1875,1914,1935,1947,1971,1972,1974,1998,2002,2003,2004,2021,2022,2030,2033,2034,2035,2038,2040,2041,2042,2043,2045,2047,2048,2065,2068,2099,2105,2106,2111,2119,2126,2135,2144,2160,2161,2170,2179,2190,2191,2196,2200,2251,2260,2288,2323,2366,2381,2383,2393,2394,2399,2401,2492,2500,2522,2557,2601,2602,2604,2605,2607,2608,2638,2701,2702,2710,2718,2725,2800,2809,2811,2869,2875,2909,2910,2920,2968,2998,3005,3006,3007,3011,3017,3031,3052,3071,3077,3119,3162,3168,3211,3221,3260,3261,3268,3269,3283,3300,3301,3304,3307,3322,3323,3324,3325,3351,3367,3369,3370,3371,3372,3376,3390,3400,3404,3410,3476,3493,3514,3517,3527,3546,3551,3659,3684,3689,3697,3700,3731,3766,3784,3792,3800,3801,3808,3809,3814,3820,3824,3826,3827,3828,3846,3848,3849,3851,3852,3853,3859,3863,3869,3871,3878,3889,3905,3914,3918,3920,3945,3971,3995,3998,4002,4003,4004,4006,4045,4111,4125,4126,4129,4224,4279,4343,4444,4445,4446,4449,4550,4662,4900,4998,5004,5030,5033,5054,5061,5087,5102,5120,5214,5221,5222,5226,5269,5298,5405,5414,5431,5440,5500,5510,5550,5633,5679,5718,5730,5801,5802,5810,5815,5822,5825,5850,5859,5862,5877,5901,5903,5904,5906,5907,5910,5911,5915,5922,5925,5950,5952,5959,5960,5961,5962,5963,5987,5988,5989,5998,5999,6005,6007,6009,6025,6059,6106,6112,6123,6129,6156,6346,6389,6502,6547,6566,6567,6580,6667,6668,6669,6689,6692,6779,6788,6792,6839,6881,6901,7019,7025,7103,7106,7402,7435,7496,7512,7625,7627,7676,7741,7800,7911,7920,7937,7938,8194,8254,8290,8291,8292,8651,8652,8654,8701,8873,8994,9040,9071,9102,9207,9220,9290,9415,9418,9485,9502,9503,9535,9575,9593,9594,9618,9877,9878,9917,9929,9943,9944,9968,10012,10180,10215,10243,10566,10616,10617,10621,10626,10628,10629,10778,11110,11111,11967,12000,12174,12265,13456,13722,13782,13783,14238,14441,14442,15002,15003,15660,15742,16000,16001,16012,16016,16018,16113,16992,16993,17877,17988,18040,18101,18988,19283,19315,19350,19780,19801,19842,20005,20031,20221,20222,20828,21571,22939,23502,24444,24800,25734,25735,26214,27352,27353,27355,27356,27715,28201,30718,30951,31038,31337,32769,32770,32771,32772,32773,32774,32775,32776,32777,32778,32779,32780,32781,32782,32783,32784,32785,33354,33899,34571,34572,34573,35500,38292,40193,40911,41511,42510,44176,44442,44443,44501,45100,49158,49159,49160,49161,49163,49165,49167,49175,49176,49400,49999,50001,50002,50003,50006,50300,50389,50500,50636,50800,51103,51493,52673,52822,52848,52869,54045,54328,55055,55056,55555,55600,56737,56738,57294,57797,60020,60443,61532,61900,62078,63331,64623,64680,65129,65389',
    topdb: '1521,1630,1158,1433,50000,1527,5432,3306,27017,7474,2181,60000,60010,60020,60030,8080,8085,9090,9095,6379,11211,389,636,2888,3888,5672,5671,61616,1883,61613,9200,9300',
    topdp: 'U:53,U:123,U:161,U:162,U:179,U:445,U:1194,U:1701,U:1812,U:5353',
    topudp: 'U:53,U:123,U:161,U:162,U:179,U:445,U:1194,U:1701,U:1812,U:5353',
    defect: '21,11211,27017,1433,1521,3306,5432,3389,6379,137,138,139,445,22,8080,3389,5900,5901,590',
    fast: '7,9,13,17,19,21,22,23,25,26,37,53,79,80,81,82,83,84,85,86,87,88,89,90,91,92,98,99,106,110,111,113,119,135,137,138,139,143,144,179,199,255,389,427,443,444,445,465,513,514,515,543,544,548,554,587,590,631,636,646,800,801,808,873,880,888,889,990,993,995,1000,1010,1024,1025,1026,1027,1028,1029,1030,1041,1048,1049,1053,1054,1056,1064,1065,1080,1081,1082,1110,1118,1158,1433,1443,1521,1527,1630,1720,1723,1755,1801,1883,1888,1900,1980,2000,2001,2008,2020,2049,2100,2103,2107,2121,2181,2375,2717,2888,2967,3000,3001,3008,3128,3306,3389,3505,3703,3888,3986,4899,5000,5001,5009,5050,5051,5060,5101,5190,5357,5432,5555,5631,5666,5671,5672,5800,5900,5901,6000,6001,6004,6080,6379,6646,6648,6677,6868,6888,7000,7001,7002,7003,7004,7005,7007,7008,7070,7071,7074,7078,7080,7088,7200,7474,7680,7687,7688,7777,7890,8000,8001,8002,8003,8004,8006,8008,8009,8010,8011,8012,8016,8018,8020,8028,8030,8031,8038,8042,8044,8046,8048,8053,8060,8069,8070,8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8091,8092,8093,8094,8095,8096,8097,8098,8099,8100,8101,8108,8118,8161,8172,8180,8181,8200,8222,8244,8258,8280,8288,8300,8360,8443,8448,8484,8800,8834,8838,8848,8858,8868,8879,8880,8881,8888,8899,8983,8989,9000,9001,9002,9008,9010,9043,9060,9080,9081,9082,9083,9084,9085,9086,9087,9088,9089,9090,9091,9092,9093,9094,9095,9096,9097,9098,9099,9100,9200,9300,9443,9448,9800,9981,9986,9988,9998,9999,10000,10001,10002,10004,10008,10010,10250,10255,11211,12018,12443,14000,16080,18000,18001,18002,18004,18008,18080,18082,18088,18090,18098,19001,20000,20720,21000,21501,21502,27017,28017,28018,32768,38501,38888,41516,49152,49153,49154,49155,49156,49157,50000,60000,60010,60020,60030,61613,61616,',
    middle: '1,7,9,13,17,19,21,22,23,25,26,37,42,49,53,69,79,80,81,82,83,84,85,86,87,88,89,90,91,92,98,99,105,106,110,111,113,119,123,135,137,138,139,143,144,161,179,199,222,255,264,384,389,402,407,427,443,444,445,465,500,502,513,514,515,540,543,544,548,554,587,590,617,623,631,636,646,689,705,771,777,783,800,801,808,873,880,888,889,902,910,912,921,990,993,995,998,999,1000,1010,1024,1025,1026,1027,1028,1029,1030,1035,1041,1048,1049,1053,1054,1056,1064,1065,1070,1080,1081,1082,1090,1110,1118,1158,1199,1211,1220,1234,1241,1300,1311,1352,1433,1440,1443,1494,1521,1527,1530,1533,1604,1630,1720,1723,1755,1801,1811,1883,1888,1900,1980,2000,2001,2008,2020,2049,2082,2083,2100,2103,2107,2121,2181,2199,2207,2222,2323,2362,2375,2525,2533,2598,2601,2604,2638,2717,2809,2888,2947,2967,3000,3001,3008,3037,3050,3057,3128,3200,3217,3273,3299,3306,3311,3312,3389,3460,3500,3505,3628,3632,3690,3703,3780,3790,3817,3888,3986,4000,4322,4433,4659,4679,4848,4899,5000,5001,5009,5038,5040,5050,5051,5060,5093,5101,5168,5190,5247,5250,5351,5353,5355,5357,5400,5405,5432,5498,5555,5560,5580,5601,5631,5666,5671,5672,5800,5814,5900,5901,5920,6000,6001,6004,6050,6060,6070,6080,6082,6101,6106,6112,6262,6379,6405,6542,6646,6648,6667,6677,6868,6888,6905,6988,7000,7001,7002,7003,7004,7005,7007,7008,7021,7070,7071,7074,7078,7080,7088,7144,7181,7200,7210,7443,7474,7510,7680,7687,7688,7700,7770,7777,7787,7879,7890,7902,8000,8001,8002,8003,8004,8006,8008,8009,8010,8011,8012,8014,8016,8018,8020,8023,8028,8030,8031,8038,8042,8044,8046,8048,8053,8060,8069,8070,8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8091,8092,8093,8094,8095,8096,8097,8098,8099,8100,8101,8108,8118,8161,8172,8180,8181,8200,8205,8222,8244,8258,8280,8288,8300,8303,8333,8360,8400,8443,8448,8484,8503,8800,8812,8834,8838,8848,8858,8868,8879,8880,8881,8888,8899,8983,8989,9000,9001,9002,9008,9010,9043,9060,9080,9081,9082,9083,9084,9085,9086,9087,9088,9089,9090,9091,9092,9093,9094,9095,9096,9097,9098,9099,9100,9111,9152,9200,9300,9443,9448,9495,9800,9855,9981,9986,9988,9998,9999,10000,10001,10002,10004,10008,10010,10080,10098,10162,10250,10255,10443,10616,10628,11000,11099,11211,11234,11333,12018,12174,12203,12221,12345,12397,12401,12443,13364,13500,13838,14000,14330,15200,16080,16102,17185,17200,18000,18001,18002,18004,18008,18080,18082,18088,18090,18098,18881,19001,19300,19810,20000,20010,20031,20034,20101,20111,20171,20222,20720,21000,21501,21502,22222,23472,23791,23943,25000,25025,26000,26122,27000,27017,27888,28017,28018,28222,28784,30000,30718,31001,31099,32764,32768,32913,34205,34443,37718,38080,38292,38501,38888,40007,41025,41080,41516,44334,44818,45230,48899,49152,49153,49154,49155,49156,49157,50000,50013,52302,55553,57772,60000,60010,60020,60030,61613,61616,62078,62514,65535,10050-10051,10202-10203,109-111,1098-1103,1128-1129,137-139,1433-1435,1581-1582,2000-2001,21-23,2380-2381,41523-41524,443-446,4444-4445,46823-46824,47001-47002,50000-50004,50500-50504,5060-5061,512-515,523-524,5432-5433,5520-5521,5554-5555,5631-5632,5900-5910,5984-5986,6502-6504,6660-6661,7000-7003,7579-7580,7777-7778,7800-7801,79-81,8000-8001,8000-8003,8080-8082,8080-8083,8443-8444,8888-8890,8901-8903,9000-9002,9080-9081,9099-9100,9390-9391,9809-9815,9999-10001',
    slow: '1,3,4,6,7,8,9,13,17,19,20,21,22,23,24,25,26,27,30,32,33,37,42,43,49,53,55,57,59,60,65,66,68,70,73,77,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,102,103,104,106,108,109,110,111,113,114,119,122,123,125,127,132,133,135,137,138,139,143,144,146,157,161,163,171,179,180,188,198,199,200,206,208,210,211,212,220,222,223,225,235,250,251,252,254,255,256,257,259,264,268,270,280,299,301,302,306,308,309,311,321,333,340,366,381,388,389,403,406,407,411,416,417,419,421,423,425,427,436,441,442,443,444,445,447,458,464,465,475,481,497,500,502,511,512,513,514,515,517,522,523,524,540,541,543,544,545,548,554,555,556,557,560,563,586,587,590,591,593,600,602,606,610,616,617,621,623,625,631,636,639,641,646,648,655,657,659,660,666,667,668,669,674,683,684,687,688,690,691,700,701,705,709,710,711,713,714,715,720,722,725,726,728,729,730,731,732,733,740,748,749,754,757,758,765,770,777,778,780,782,783,786,787,790,792,795,800,801,802,803,804,805,806,807,808,809,810,811,812,822,823,825,829,839,840,843,846,856,859,860,862,864,866,873,874,877,878,880,888,889,898,900,901,902,903,904,905,911,912,913,916,918,921,922,924,925,928,930,931,943,953,955,956,968,969,971,980,981,983,987,990,992,993,995,996,998,999,1000,1001,1002,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1116,1117,1118,1119,1121,1122,1123,1124,1125,1126,1127,1128,1130,1131,1132,1134,1135,1136,1137,1138,1141,1143,1144,1145,1147,1148,1149,1150,1151,1152,1153,1154,1156,1157,1158,1159,1162,1163,1164,1165,1166,1167,1168,1169,1173,1174,1175,1176,1179,1180,1182,1183,1184,1185,1186,1187,1188,1190,1191,1192,1194,1195,1196,1198,1199,1200,1201,1204,1207,1208,1209,1210,1211,1212,1213,1215,1216,1217,1218,1220,1221,1222,1223,1228,1229,1233,1234,1236,1239,1240,1241,1243,1244,1247,1248,1249,1250,1251,1259,1261,1262,1264,1268,1270,1271,1272,1276,1277,1279,1282,1287,1290,1291,1296,1297,1299,1300,1301,1302,1303,1305,1306,1307,1308,1309,1310,1311,1313,1314,1315,1316,1317,1318,1319,1321,1322,1324,1327,1328,1330,1331,1334,1336,1337,1339,1340,1347,1350,1351,1352,1353,1356,1357,1389,1413,1414,1417,1433,1434,1443,1445,1455,1461,1494,1500,1501,1503,1516,1521,1522,1524,1525,1526,1527,1533,1547,1550,1556,1558,1559,1560,1565,1566,1569,1580,1583,1584,1592,1594,1598,1600,1603,1605,1607,1615,1620,1622,1630,1632,1635,1638,1641,1645,1658,1666,1677,1680,1683,1687,1688,1691,1694,1699,1700,1701,1703,1707,1708,1709,1711,1712,1713,1715,1717,1718,1719,1720,1721,1722,1723,1730,1735,1736,1745,1750,1752,1753,1755,1761,1782,1783,1790,1791,1792,1799,1800,1801,1805,1806,1807,1808,1811,1812,1818,1823,1825,1835,1839,1840,1858,1861,1862,1863,1864,1871,1875,1883,1888,1900,1901,1911,1912,1914,1918,1924,1927,1933,1935,1947,1949,1954,1958,1971,1972,1973,1974,1975,1976,1979,1980,1981,1982,1984,1988,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2020,2021,2022,2025,2030,2031,2033,2034,2035,2038,2040,2041,2042,2043,2044,2045,2046,2047,2048,2049,2051,2060,2062,2065,2067,2068,2069,2070,2080,2081,2082,2083,2086,2087,2093,2095,2096,2099,2100,2101,2103,2104,2105,2106,2107,2110,2111,2112,2115,2119,2121,2124,2125,2126,2134,2135,2142,2144,2148,2150,2160,2161,2168,2170,2179,2181,2187,2190,2191,2196,2197,2200,2201,2203,2222,2224,2232,2241,2250,2251,2253,2260,2261,2262,2265,2269,2270,2271,2280,2288,2291,2292,2300,2301,2302,2304,2312,2313,2323,2325,2326,2330,2335,2340,2348,2366,2371,2372,2375,2381,2382,2383,2391,2393,2394,2399,2401,2418,2425,2433,2435,2436,2438,2439,2449,2456,2463,2472,2480,2490,2492,2500,2501,2505,2517,2521,2522,2525,2531,2532,2550,2551,2557,2558,2567,2580,2583,2584,2585,2598,2600,2601,2602,2604,2605,2606,2607,2608,2622,2623,2628,2631,2638,2644,2663,2691,2700,2701,2702,2706,2710,2711,2712,2717,2718,2723,2725,2728,2734,2800,2804,2806,2808,2809,2811,2812,2847,2850,2869,2875,2882,2886,2888,2889,2898,2901,2902,2903,2908,2909,2910,2920,2930,2957,2958,2967,2968,2973,2984,2987,2988,2991,2997,2998,3000,3001,3002,3003,3005,3006,3007,3008,3010,3011,3012,3013,3014,3017,3023,3025,3030,3031,3033,3050,3052,3057,3062,3063,3071,3077,3080,3089,3094,3102,3103,3118,3119,3121,3128,3133,3146,3162,3167,3168,3190,3200,3210,3211,3216,3220,3221,3240,3260,3261,3263,3268,3269,3280,3281,3283,3291,3299,3300,3301,3304,3306,3307,3310,3311,3312,3319,3322,3323,3324,3325,3333,3334,3351,3362,3363,3365,3367,3368,3369,3370,3371,3372,3374,3376,3377,3380,3388,3389,3390,3396,3398,3399,3400,3404,3410,3414,3415,3419,3425,3430,3437,3439,3443,3456,3465,3476,3479,3483,3485,3486,3493,3497,3503,3505,3506,3511,3513,3514,3515,3517,3519,3520,3526,3527,3530,3532,3535,3546,3551,3577,3580,3586,3588,3599,3600,3602,3603,3606,3618,3621,3622,3632,3636,3637,3652,3653,3656,3658,3659,3663,3668,3669,3670,3672,3680,3681,3683,3684,3689,3690,3697,3700,3703,3712,3721,3728,3731,3737,3742,3749,3765,3766,3784,3787,3788,3790,3792,3793,3795,3796,3798,3799,3800,3801,3803,3806,3808,3809,3810,3811,3812,3813,3814,3817,3820,3823,3824,3825,3826,3827,3828,3830,3831,3837,3839,3842,3846,3847,3848,3849,3850,3851,3852,3853,3856,3859,3860,3863,3868,3869,3870,3871,3872,3876,3878,3879,3880,3882,3888,3889,3890,3897,3899,3901,3902,3904,3905,3906,3907,3908,3909,3911,3913,3914,3915,3916,3918,3919,3920,3922,3923,3928,3929,3930,3931,3935,3936,3937,3938,3940,3941,3943,3944,3945,3946,3948,3949,3952,3956,3957,3961,3962,3963,3964,3967,3968,3969,3971,3972,3975,3979,3980,3981,3982,3983,3986,3989,3990,3991,3992,3993,3994,3995,3996,3997,3998,3999,4000,4001,4002,4003,4004,4005,4006,4007,4009,4010,4016,4020,4022,4023,4024,4025,4029,4035,4036,4039,4040,4045,4056,4058,4065,4080,4087,4090,4096,4100,4101,4111,4112,4113,4118,4119,4120,4121,4125,4126,4129,4135,4141,4143,4147,4158,4161,4164,4174,4180,4190,4192,4200,4206,4220,4224,4234,4237,4242,4252,4262,4279,4294,4297,4298,4300,4302,4321,4325,4328,4333,4342,4343,4355,4356,4357,4358,4369,4374,4375,4376,4380,4384,4388,4389,4401,4407,4414,4415,4418,4430,4433,4440,4442,4443,4444,4445,4446,4447,4449,4453,4454,4455,4464,4471,4476,4480,4497,4503,4516,4517,4530,4534,4545,4550,4555,4558,4559,4567,4569,4570,4599,4600,4601,4602,4606,4609,4644,4649,4658,4662,4665,4687,4689,4700,4712,4713,4745,4760,4767,4770,4771,4778,4793,4800,4819,4848,4850,4859,4860,4875,4876,4877,4881,4899,4900,4903,4912,4931,4949,4998,4999,5000,5001,5002,5003,5004,5005,5009,5010,5011,5012,5013,5014,5015,5016,5017,5020,5021,5023,5030,5033,5040,5050,5051,5052,5053,5054,5055,5060,5061,5063,5066,5070,5074,5080,5081,5087,5088,5090,5095,5096,5098,5100,5101,5102,5111,5114,5118,5120,5121,5122,5125,5133,5137,5147,5151,5152,5155,5156,5190,5200,5201,5202,5203,5212,5214,5219,5221,5222,5223,5225,5226,5233,5234,5235,5242,5250,5252,5255,5256,5259,5261,5269,5279,5280,5291,5298,5339,5347,5353,5357,5370,5377,5405,5414,5423,5431,5432,5433,5440,5441,5442,5444,5457,5458,5473,5475,5500,5501,5502,5510,5520,5544,5550,5552,5553,5555,5560,5561,5566,5600,5601,5631,5632,5633,5644,5655,5656,5666,5671,5672,5678,5679,5680,5718,5730,5757,5780,5800,5801,5802,5803,5807,5810,5811,5812,5815,5818,5822,5823,5825,5850,5859,5862,5868,5869,5877,5881,5887,5888,5898,5899,5900,5901,5902,5903,5904,5905,5906,5907,5909,5910,5911,5914,5915,5918,5922,5925,5938,5940,5950,5952,5959,5960,5961,5962,5963,5966,5968,5981,5987,5988,5989,5998,5999,6000,6001,6002,6003,6004,6005,6006,6007,6008,6009,6010,6011,6017,6020,6025,6050,6051,6059,6060,6068,6080,6088,6090,6100,6101,6103,6106,6112,6118,6123,6129,6156,6167,6170,6180,6198,6203,6222,6226,6247,6259,6286,6346,6365,6372,6379,6388,6389,6443,6481,6500,6502,6504,6510,6520,6543,6546,6547,6550,6565,6566,6567,6580,6587,6600,6602,6603,6606,6611,6646,6648,6662,6664,6666,6667,6668,6669,6670,6677,6680,6688,6689,6692,6699,6711,6732,6778,6779,6788,6789,6792,6800,6801,6839,6842,6868,6869,6879,6881,6886,6887,6888,6889,6890,6896,6901,6920,6969,6988,7000,7001,7002,7003,7004,7005,7006,7007,7008,7009,7010,7011,7012,7017,7018,7019,7020,7021,7022,7023,7024,7025,7028,7031,7041,7044,7048,7050,7051,7055,7060,7070,7071,7072,7074,7078,7080,7081,7082,7083,7084,7086,7088,7090,7093,7094,7100,7101,7102,7103,7106,7108,7111,7117,7123,7129,7140,7171,7180,7200,7201,7202,7215,7241,7272,7273,7278,7280,7281,7288,7300,7321,7330,7380,7402,7435,7438,7443,7474,7496,7500,7501,7512,7547,7567,7625,7627,7676,7680,7687,7688,7700,7702,7703,7709,7711,7713,7725,7741,7742,7744,7749,7751,7770,7776,7777,7778,7788,7789,7791,7799,7800,7801,7856,7878,7888,7890,7896,7899,7900,7901,7903,7909,7911,7913,7915,7920,7921,7925,7929,7937,7938,7942,7943,7979,7995,7999,8000,8001,8002,8003,8004,8005,8006,8007,8008,8009,8010,8011,8012,8013,8014,8015,8016,8017,8018,8019,8020,8021,8022,8023,8024,8025,8026,8027,8028,8029,8030,8031,8032,8033,8035,8036,8037,8038,8039,8040,8041,8042,8043,8044,8045,8046,8048,8049,8050,8051,8052,8053,8054,8055,8056,8057,8058,8060,8061,8062,8064,8065,8066,8067,8068,8069,8070,8071,8073,8075,8077,8078,8079,8080,8081,8082,8083,8084,8085,8086,8087,8088,8089,8090,8091,8092,8093,8094,8095,8096,8097,8098,8099,8100,8101,8102,8103,8104,8105,8108,8110,8111,8112,8118,8119,8122,8123,8130,8133,8136,8144,8153,8161,8168,8172,8176,8180,8181,8182,8183,8184,8186,8188,8189,8190,8191,8192,8193,8194,8196,8197,8200,8201,8202,8213,8220,8222,8232,8244,8250,8254,8258,8260,8280,8281,8282,8283,8288,8290,8291,8292,8293,8294,8298,8300,8308,8322,8333,8341,8343,8360,8380,8381,8382,8383,8384,8385,8390,8391,8399,8400,8401,8402,8403,8443,8445,8448,8465,8477,8480,8481,8484,8488,8499,8500,8512,8540,8548,8567,8580,8582,8585,8600,8601,8610,8648,8649,8651,8652,8654,8660,8666,8675,8676,8680,8681,8684,8686,8688,8700,8701,8710,8720,8735,8765,8766,8777,8780,8781,8787,8788,8799,8800,8801,8802,8806,8808,8809,8810,8813,8820,8822,8828,8834,8838,8839,8844,8848,8858,8860,8861,8864,8866,8868,8873,8877,8879,8880,8881,8885,8886,8887,8888,8889,8890,8891,8892,8893,8895,8896,8898,8899,8900,8901,8902,8905,8910,8912,8913,8955,8956,8972,8974,8980,8983,8987,8988,8989,8990,8991,8992,8994,8996,8997,8999,9000,9001,9002,9003,9004,9005,9006,9007,9008,9009,9010,9011,9012,9013,9014,9015,9019,9020,9022,9025,9030,9031,9036,9038,9039,9040,9043,9050,9053,9060,9061,9068,9070,9071,9080,9081,9082,9083,9084,9085,9086,9087,9088,9089,9090,9091,9092,9093,9094,9095,9096,9097,9098,9099,9100,9101,9102,9103,9105,9110,9111,9112,9113,9119,9131,9152,9168,9180,9182,9188,9190,9191,9192,9197,9198,9200,9201,9207,9212,9220,9224,9231,9290,9300,9301,9302,9333,9409,9415,9418,9437,9443,9444,9448,9485,9494,9500,9501,9502,9503,9504,9507,9512,9517,9527,9535,9541,9542,9575,9593,9594,9595,9600,9618,9621,9643,9666,9673,9696,9704,9718,9800,9801,9815,9836,9845,9876,9877,9878,9888,9889,9898,9900,9901,9909,9910,9912,9914,9917,9918,9919,9922,9929,9941,9943,9944,9968,9977,9980,9981,9986,9988,9989,9990,9991,9992,9995,9997,9998,9999,10000,10001,10002,10003,10004,10005,10007,10008,10009,10010,10011,10012,10016,10017,10021,10022,10023,10024,10025,10034,10038,10040,10050,10051,10056,10057,10058,10060,10066,10068,10069,10070,10078,10080,10082,10083,10086,10087,10088,10089,10098,10099,10101,10111,10118,10152,10154,10160,10180,10200,10215,10243,10250,10255,10333,10443,10566,10616,10617,10621,10626,10628,10629,10777,10778,10873,11000,11001,11080,11110,11111,11158,11180,11211,11212,11324,11347,11362,11366,11372,11381,11660,11967,12000,12001,12006,12018,12021,12059,12174,12215,12262,12265,12315,12333,12345,12346,12380,12443,12452,12881,13333,13382,13456,13722,13724,13782,13783,13988,14000,14007,14238,14338,14441,14442,14549,15000,15001,15002,15003,15004,15018,15080,15400,15402,15580,15660,15672,15693,15698,15742,15801,15888,16000,16001,16012,16016,16018,16080,16113,16580,16705,16788,16800,16851,16929,16992,16993,17000,17003,17071,17095,17173,17595,17777,17877,17988,18000,18001,18002,18004,18008,18018,18040,18060,18080,18081,18082,18085,18088,18090,18098,18101,18103,18181,18264,18765,18801,18803,18880,18881,18888,18889,18988,19000,19001,19010,19045,19080,19101,19244,19283,19315,19350,19780,19801,19842,19900,19994,20000,20001,20002,20005,20021,20022,20031,20046,20052,20140,20142,20151,20153,20165,20200,20202,20221,20222,20720,20806,20808,20828,20992,21000,21080,21188,21245,21501,21502,21571,21792,21900,22080,22222,22228,22343,22480,22580,22939,23052,23352,23380,23454,23458,23502,23796,24444,24800,25006,25024,25734,25735,26000,26214,26470,27000,27017,27352,27353,27355,27356,27357,27715,27779,28017,28018,28080,28099,28201,28211,28214,28280,28780,29672,29798,29831,30000,30001,30005,30015,30025,30030,30058,30082,30088,30551,30704,30718,30951,31000,31038,31082,31188,31337,31727,31945,32766,32768,32769,32770,32771,32772,32773,32774,32775,32776,32777,32778,32779,32780,32781,32782,32783,32784,32785,32791,32792,32803,32816,32822,32835,33354,33453,33554,33899,34440,34571,34572,34573,34899,35500,35513,37006,37839,38000,38037,38080,38086,38185,38188,38292,38443,38501,38517,38888,39136,39376,39659,40000,40001,40069,40080,40193,40310,40811,40911,41064,41474,41511,41516,41523,42424,42510,43651,44176,44334,44401,44442,44443,44445,44501,44709,45100,45149,45177,45692,46200,46996,47078,47088,47544,47583,48080,49152,49153,49154,49155,49156,49157,49158,49159,49160,49161,49163,49164,49165,49167,49168,49171,49175,49176,49186,49195,49236,49400,49401,49705,49960,49999,50000,50001,50002,50003,50006,50030,50045,50050,50060,50070,50075,50080,50090,50100,50240,50300,50389,50500,50636,50800,51103,51106,51191,51413,51493,52660,52673,52710,52735,52822,52847,52848,52849,52850,52851,52853,52869,53211,53313,53314,53535,54045,54328,55020,55055,55056,55070,55351,55352,55555,55576,55600,55858,56688,56737,56738,57294,57665,57797,57880,58000,58001,58002,58031,58060,58080,58083,58124,58630,58632,58838,58898,59009,59093,59110,59200,59201,59202,59777,59999,60000,60010,60020,60022,60030,60080,60101,60123,60146,60443,60465,60642,61081,61532,61613,61616,61900,61999,62078,63331,64623,64680,65000,65001,65055,65129,65310,65389,65486,65493,65533',
};

const scriptTypeOption = [
    { label: '端口与漏洞扫描', value: 'portAndVulScan' },
    { label: '敏感信息', value: 'weakinfo' },
    // { label: '信息收集', value: 'xinxishouji' },
];

// 预设端口多选数据
const presetProtsGroupOptions = [
    { label: '常见100端口', value: 'top100' },
    { label: '常见web端口', value: 'topweb' },
    { label: '常见一两千', value: 'top1000+' },
    { label: '常见数据库与MQ', value: 'topdb' },
    { label: '常见UDP端口', value: 'topdp' },
];

const targetColorFn = (key: Key) => {
    return key !== 0
        ? 'default'
        : PresetColors[Math.floor(Math.random() * PresetColors.length)];
};

const transformFormData = (values: any): TPostTaskStartRequest => {
    return {
        ...values,
        params: {
            ...values.params,
            plugins: values.params?.plugins?.ScriptName?.ids?.join(','),
            'enable-brute':
                typeof values?.params?.['enable-brute'] === 'boolean'
                    ? `${values?.params?.['enable-brute']}`
                    : undefined,
            'enbale-cve-baseline':
                typeof values?.params?.['enbale-cve-baseline'] === 'boolean'
                    ? `${values?.params?.['enbale-cve-baseline']}`
                    : undefined,
        },
        param_files: values?.param_files
            ? {
                  target: values?.param_files,
              }
            : undefined,
        end_timestamp: Array.isArray(values?.timestamp)
            ? dayjs(values?.timestamp?.[1]).unix()
            : undefined,
        start_timestamp: Array.isArray(values?.timestamp)
            ? dayjs(values?.timestamp?.[0]).unix()
            : undefined,
        execution_date: values?.execution_date
            ? dayjs(values?.execution_date).unix()
            : undefined,
        concurrent: 20,
        task_type: 'batch-invoking-script',
        enable_sched: values?.['sched_type'] !== 1 ? true : false,
        timestamp: undefined,
    };
};

// 时间 天数禁用fn
const disabledDate = (current: Dayjs | null): boolean => {
    const nowHours = dayjs().format('HH');
    const nowMinutes = dayjs().format('mm');

    if (nowHours === '59' && nowMinutes === '59') {
        return !!current && current.isBefore(dayjs().add(1, 'day'), 'day');
    } else {
        return !!current && current.isBefore(dayjs(), 'day');
    }
};

// 时间 小时分钟禁用fn
const disabledTime = (selectedDate: Dayjs | null) => {
    const now = dayjs();
    const nowHours = dayjs().format('HH');
    const nowMinutes = dayjs().format('mm');

    if (!selectedDate || !selectedDate.isSame(now, 'day')) {
        // 如果日期不是今天，不禁用时间
        return {};
    }
    // 如果当前时间为59分， 禁用当前小时
    if (nowMinutes === '59') {
        return {
            // 禁用当前小时之前的小时
            disabledHours: (): number[] => [
                ...Array(now.hour()).keys(),
                parseInt(nowHours, 10),
            ],
            disabledMinutes: () => [],
        };
    }
    // 如果不是当前小时,不禁用分钟
    if (!selectedDate || !selectedDate.isSame(now, 'hours')) {
        return {
            disabledHours: (): number[] => [...Array(now.hour()).keys()],
            disabledMinutes: (): number[] => [],
        };
    }
    return {
        disabledHours: (): number[] => [...Array(now.hour()).keys()], // 禁用当前小时之前的小时
        disabledMinutes: (): number[] => [
            ...Array(now.minute()).keys(),
            parseInt(nowMinutes, 10),
        ], // 禁用当前分钟之前的分钟
    };
};

export {
    PresetPorts,
    presetProtsGroupOptions,
    targetColorFn,
    transformFormData,
    scriptTypeOption,
    disabledDate,
    disabledTime,
};
